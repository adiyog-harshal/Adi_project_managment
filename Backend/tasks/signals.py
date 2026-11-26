
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver

from .models import Task
from projects.models import Project


def update_project_completion(project_id):
    """
    Automatically update project status based on its tasks.
    """

    project = Project.objects.filter(pk=project_id).first()

    if not project:
        return

    tasks = Task.objects.filter(project_id=project_id)

    total_tasks = tasks.count()

    completed_tasks = tasks.filter(
        status="Completed"
    ).count()

    # All tasks must be completed, and at least one task must exist.
    if total_tasks > 0 and total_tasks == completed_tasks:
        new_status = "Completed"

    # If a completed task is reopened or deleted,
    # the project must no longer remain completed.
    elif total_tasks == 0:
        new_status = "Planning"

    else:
        new_status = "In Progress"

    # Save only when necessary.
    if (
        project.status != new_status
        or (
            new_status == "Completed"
            and project.completed_at is None
        )
    ):
        project.status = new_status

        project.save(
            update_fields=["status", "completed_at"]
        )


# Remember the previous project when a task is moved.
@receiver(pre_save, sender=Task)
def remember_previous_project(sender, instance, **kwargs):

    if instance.pk:
        instance._previous_project_id = (
            Task.objects.filter(pk=instance.pk)
            .values_list("project_id", flat=True)
            .first()
        )
    else:
        instance._previous_project_id = None


# Check completion after creating or updating a task.
@receiver(post_save, sender=Task)
def check_project_after_task_save(sender, instance, created, **kwargs):

    update_project_completion(instance.project_id)

    # If the task was moved to another project,
    # also update the previous project's status.
    previous_project_id = getattr(
        instance,
        "_previous_project_id",
        None
    )

    if (
        previous_project_id
        and previous_project_id != instance.project_id
    ):
        update_project_completion(previous_project_id)


# Check completion after deleting a task.
@receiver(post_delete, sender=Task)
def check_project_after_task_delete(sender, instance, **kwargs):

    update_project_completion(instance.project_id)
