from projects.models import Notification

#=================================================
#NOTIFICATION HELPERS
#================================================
def create_notification(recipient, message):
    """
    Create an in-app notification for a user.
    """
    notification = Notification.objects.create(
        recipient=recipient,
        message=message
    )
    return notification

def mark_notification_as_read(notification):
    """
    Mark a notification as read.
    """

    notification.is_read = True
    notification.save(update_fields=['is_read'])

    return notification

def notify_task_assigned(task):
    """
    Notify the user when task is assigned to them.
    """
    if not task.assigned_to:
        return None
    return create_notification(
       recipient=task.assigned_to,
       message=(
       f"{task.task_name} has been assigned to you."
       f"on {task.project.project_name}."
    )
)
    
def notify_task_reassigned(task,previous_assignee):
    """
    Notify both the new and previous assignee when a task 
    is reassigned."""
    
    notifications = []
    new_assignee = task.assigned_to
    
    # Notify new assignee
    if new_assignee:
        notifications.append(
            create_notification(
                recipient=new_assignee,
                message=f"{task.task_name} has been reassigned."
                
            )
        ) 
    #Notify previous assignee
    if (
        previous_assignee
        and previous_assignee != new_assignee
    ):
        notifications.append(
            create_notification(
                recipient=previous_assignee,
                message=f"{task.task_name} has been reassigned."
            )
        )
    return notifications