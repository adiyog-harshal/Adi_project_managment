from datetime import date

from django.contrib.auth.models import User
from django.db.models import Q, Count
from django.http import HttpResponse
from django.utils import timezone
from django.utils.dateparse import parse_date

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import mm

from projects.models import Project
from tasks.models import Task
from sprints.models import Sprint


class ReportView(APIView):
    permission_classes = [IsAuthenticated]

    def accessible_projects(self):
        user = self.request.user

        queryset = Project.objects.all()

        if not user.is_superuser:
            queryset = queryset.filter(project_manager=user) 
                

        return queryset

    def get_filters(self):
        params = self.request.query_params

        date_from = parse_date(params.get('date_from', ''))
        date_to = parse_date(params.get('date_to', ''))

        if params.get('date_from') and not date_from:
            raise ValueError('Invalid date_from. Use YYYY-MM-DD.')

        if params.get('date_to') and not date_to:
            raise ValueError('Invalid date_to. Use YYYY-MM-DD.')

        if date_from and date_to and date_from > date_to:
            raise ValueError('Start date cannot be after end date.')

        return {
            'project': params.get('project'),
            'sprint': params.get('sprint'),
            'status': params.get('status'),
            'assigned_to': params.get('assigned_to'),
            'date_from': date_from,
            'date_to': date_to,
        }

    def filtered_tasks(self, filters):
        queryset = Task.objects.filter(
            project__in=self.accessible_projects()
        ).select_related(
            'project', 'sprint', 'assigned_to'
        )

        if filters['project']:
            queryset = queryset.filter(project_id=filters['project'])

        if filters['sprint']:
            queryset = queryset.filter(sprint_id=filters['sprint'])

        if filters['status']:
            queryset = queryset.filter(status=filters['status'])

        if filters['assigned_to']:
            queryset = queryset.filter(
                assigned_to_id=filters['assigned_to']
            )

        if filters['date_from']:
            queryset = queryset.filter(
                due_date__gte=filters['date_from']
            )

        if filters['date_to']:
            queryset = queryset.filter(
                due_date__lte=filters['date_to']
            )

        return queryset.order_by('due_date', 'task_name')

    def project_report(self, filters):
        queryset = self.accessible_projects()

        if filters['project']:
            queryset = queryset.filter(id=filters['project'])

        if filters['date_from']:
            queryset = queryset.filter(
                start_date__gte=filters['date_from']
            )

        if filters['date_to']:
            queryset = queryset.filter(
                start_date__lte=filters['date_to']
            )

        rows = []

        for project in queryset.select_related('project_manager'):
            tasks = Task.objects.filter(project=project)
            total = tasks.count()
            completed = tasks.filter(status='Completed').count()

            rows.append({
                'project': project.project_name,
                'manager': (
                    project.project_manager.get_full_name()
                    or project.project_manager.username
                    if project.project_manager else 'Unassigned'
                ),
                'start_date': str(project.start_date),
                'end_date': str(project.end_date or ''),
                'status': project.status,
                'total_tasks': total,
                'completed_tasks': completed,
                'pending_tasks': total - completed,
                'completion': round(
                    completed * 100 / total, 2
                ) if total else 0,
            })

        return rows

    def task_report(self, filters):
        today = timezone.localdate()
        rows = []

        for task in self.filtered_tasks(filters):
            overdue = (
                task.due_date < today
                and task.status != 'Completed'
                if task.due_date else False
            )

            rows.append({
                'task': task.task_name,
                'project': task.project.project_name,
                'sprint': task.sprint.sprint_name if task.sprint else '',
                'assigned_to': (
                    task.assigned_to.get_full_name()
                    or task.assigned_to.username
                    if task.assigned_to else 'Unassigned'
                ),
                'due_date': str(task.due_date or ''),
                'status': task.status,
                'priority': task.priority,
                'overdue_days': (
                    (today - task.due_date).days if overdue else 0
                ),
            })

        return rows

    def sprint_report(self, filters):
        queryset = Sprint.objects.filter(
            project__in=self.accessible_projects()
        ).select_related('project')

        if filters['project']:
            queryset = queryset.filter(project_id=filters['project'])

        if filters['sprint']:
            queryset = queryset.filter(id=filters['sprint'])

        if filters['date_from']:
            queryset = queryset.filter(
                start_date__gte=filters['date_from']
            )

        if filters['date_to']:
            queryset = queryset.filter(
                start_date__lte=filters['date_to']
            )

        rows = []

        for sprint in queryset.order_by('start_date'):
            tasks = Task.objects.filter(
                project=sprint.project,
                sprint=sprint
            )

            if filters['status']:
                tasks = tasks.filter(status=filters['status'])

            if filters['assigned_to']:
                tasks = tasks.filter(
                    assigned_to_id=filters['assigned_to']
                )

            total = tasks.count()
            completed = tasks.filter(status='Completed').count()
            in_progress = tasks.filter(status='In Progress').count()

            rows.append({
                'sprint': sprint.sprint_name,
                'project': sprint.project.project_name,
                'start_date': str(sprint.start_date),
                'end_date': str(sprint.end_date),
                'status': sprint.status,
                'total_tasks': total,
                'completed_tasks': completed,
                'in_progress_tasks': in_progress,
                'pending_tasks': total - completed,
                'completion': round(
                    completed * 100 / total, 2
                ) if total else 0,
            })

        return rows

    def workload_report(self, filters):
        tasks = self.filtered_tasks(filters)
        user_ids = tasks.exclude(
            assigned_to__isnull=True
        ).values_list('assigned_to_id', flat=True).distinct()

        rows = []
        today = timezone.localdate()

        for user in User.objects.filter(id__in=user_ids).order_by('username'):
            user_tasks = tasks.filter(assigned_to=user)

            total = user_tasks.count()
            completed = user_tasks.filter(status='Completed').count()
            in_progress = user_tasks.filter(status='In Progress').count()
            pending = user_tasks.filter(
                status__in=['To Do', 'On Hold']
            ).count()
            overdue = user_tasks.filter(
                due_date__lt=today
            ).exclude(status='Completed').count()

            projects = list(
                user_tasks.values_list(
                    'project__project_name', flat=True
                ).distinct()
            )

            rows.append({
                'employee': user.get_full_name() or user.username,
                'total_tasks': total,
                'completed_tasks': completed,
                'in_progress_tasks': in_progress,
                'pending_tasks': pending,
                'overdue_tasks': overdue,
                'projects': ', '.join(projects),
            })

        return rows

    def make_excel(self, rows, report_type):
        workbook = Workbook()
        sheet = workbook.active
        sheet.title = report_type.title()[:31]

        headers = list(rows[0].keys()) if rows else ['Message']
        sheet.append(headers)

        if not rows:
            sheet.append(['No records found for the selected filters.'])

        for row in rows:
            if rows:
                sheet.append(list(row.values()))

        for cell in sheet[1]:
            cell.font = Font(bold=True, color='FFFFFF')
            cell.fill = PatternFill(
                'solid', fgColor='6C5CE7'
            )
            cell.alignment = Alignment(horizontal='center')

        for column in sheet.columns:
            width = max(
                len(str(cell.value or '')) for cell in column
            ) + 3
            sheet.column_dimensions[
                column[0].column_letter
            ].width = min(width, 35)

        response = HttpResponse(
            content_type=(
                'application/vnd.openxmlformats-officedocument.'
                'spreadsheetml.sheet'
            )
        )
        response['Content-Disposition'] = (
            f'attachment; filename="{report_type}_report.xlsx"'
        )
        workbook.save(response)
        return response

    def make_pdf(self, rows, report_type):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = (
            f'attachment; filename="{report_type}_report.pdf"'
        )

        document = SimpleDocTemplate(
            response,
            pagesize=landscape(A4),
            rightMargin=10 * mm,
            leftMargin=10 * mm,
        )

        styles = getSampleStyleSheet()
        elements = [
            Paragraph(
                f'{report_type.title()} Report',
                styles['Title']
            ),
            Spacer(1, 8 * mm),
        ]

        if rows:
            headers = list(rows[0].keys())
            data = [headers]

            for row in rows:
                data.append([
                    str(value) for value in row.values()
                ])
        else:
            data = [['Message'], [
                'No records found for the selected filters.'
            ]]

        table = Table(data, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6C5CE7')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 7),
            ('GRID', (0, 0), (-1, -1), 0.4, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [
                colors.white, colors.HexColor('#F2F0FF')
            ]),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))

        elements.append(table)
        document.build(elements)
        return response

    def get(self, request):
        try:
            filters = self.get_filters()
            report_type = request.query_params.get(
                'report_type', 'projects'
            ).lower()

            report_functions = {
                'projects': self.project_report,
                'tasks': self.task_report,
                'sprints': self.sprint_report,
                'workload': self.workload_report,
            }

            if report_type not in report_functions:
                return Response({
                    'error': 'Invalid report_type. Choose projects, tasks, sprints, or workload.'
                }, status=400)

            rows = report_functions[report_type](filters)

            export_format = request.query_params.get('export_format', '').lower()

            if export_format == 'excel':
                return self.make_excel(rows, report_type)

            if export_format == 'pdf':
                return self.make_pdf(rows, report_type)

            if export_format:
                return Response({
                    'error': 'Invalid format. Choose excel or pdf.'
                }, status=400)

            return Response({
                'report_type': report_type,
                'count': len(rows),
                'filters': {
                    'project': filters['project'],
                    'sprint': filters['sprint'],
                    'status': filters['status'],
                    'assigned_to': filters['assigned_to'],
                    'date_from': str(filters['date_from'] or ''),
                    'date_to': str(filters['date_to'] or ''),
                },
                'rows': rows,
            })

        except ValueError as error:
            return Response({'error': str(error)}, status=400)
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from projects.models import Project
from tasks.models import Task
from sprints.models import Sprint


class ReportOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.all()

        if not request.user.is_superuser:
            projects = projects.filter(
                Q(project_members__user=request.user) |
                Q(project_manager=request.user)
            ).distinct()

        project_ids = projects.values_list('id', flat=True)

        sprints = Sprint.objects.filter(
            project_id__in=project_ids
        ).select_related('project').order_by('sprint_name')

        tasks = Task.objects.filter(
            project_id__in=project_ids
        ).select_related('assigned_to')

        user_ids = tasks.exclude(
            assigned_to__isnull=True
        ).values_list('assigned_to_id', flat=True).distinct()

        users = User.objects.filter(
            id__in=user_ids
        ).order_by('username')

        return Response({
            'projects': [
                {'id': p.id, 'name': p.project_name}
                for p in projects.order_by('project_name')
            ],
            'sprints': [
                {
                    'id': s.id,
                    'name': s.sprint_name,
                    'project_id': s.project_id
                }
                for s in sprints
            ],
            'employees': [
                {
                    'id': u.id,
                    'name': u.get_full_name() or u.username
                }
                for u in users
            ]
        })
