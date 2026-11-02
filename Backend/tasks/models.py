from django.db import models
from django.contrib.auth.models import User
from projects.models import Project
from django.conf import settings
from sprints.models import Sprint


# Create your models here.

class Task(models.Model):

    STATUS_CHOICES = [
        ('To Do', 'To Do'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('On Hold', 'On Hold'),
    ]

    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]

    task_name = models.CharField(max_length=200)

    description = models.TextField(blank=True)

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='tasks'
    )

    milestone = models.ForeignKey(
        'milestones.Milestone',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks'
    )
    
    sprint = models.ForeignKey(
    'sprints.Sprint',
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='tasks'
    )
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks'
    )

    start_date = models.DateField(
        null=True,
        blank=True
    )

    due_date = models.DateField(
        null=True,
        blank=True
    )
    actual_start_date = models.DateField(
        null=True,
        blank=True
    )

    actual_end_date = models.DateField(
        null=True,
        blank=True
    )
    actual_time_minutes = models.PositiveIntegerField(
        default=0
    )
    estimated_time_minutes = models.PositiveIntegerField(
            default=0
    )

    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='To Do'
    )

    priority = models.CharField(
        max_length=50,
        choices=PRIORITY_CHOICES,
        
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.task_name


class TaskComment(models.Model):

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="comments"

    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="task_comments"
    )

    message = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.user.username}: {self.message[:30]}"

class TaskSprintHistory(models.Model):
    task = models.ForeignKey(
        "tasks.Task",
        on_delete=models.CASCADE,
        related_name="sprint_history"
    )
    from_sprint = models.ForeignKey(
        Sprint,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="outgoing_task_history"
    )
    to_sprint = models.ForeignKey(
        Sprint,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="incoming_task_history"
    )
    status_at_move = models.CharField(max_length=50)
    moved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    moved_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True, default="")

    def __str__(self):
        return f"Task {self.task_id}: sprint carryover"

    class Meta:
        ordering = ["-moved_at"]
        

class TimeLog(models.Model):
    task = models.ForeignKey(
        "tasks.Task",
        on_delete=models.CASCADE,
        related_name="time_logs"
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="task_time_logs"
    )

    # Sprint when the work was logged
    sprint = models.ForeignKey(
        "sprints.Sprint",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="time_logs"
    )

    duration_minutes = models.PositiveIntegerField()
    work_date = models.DateField()
    description = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-work_date", "-created_at"]

    def __str__(self):
        return f"Task {self.task_id} - {self.duration_minutes} minutes"


class TaskTimer(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="timers"
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="task_timers"
    )

    started_at = models.DateTimeField(auto_now_add=True)
    is_running = models.BooleanField(default=True)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        return f"{self.user.username} - {self.task.task_name}"