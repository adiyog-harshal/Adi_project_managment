
from .models import ActivityLog


def log_activity(
    *,
    user=None,
    module,
    action,
    object_id=None,
    object_name="",
    description,
    old_values=None,
    new_values=None
):
    """
    Centralized activity logging service.
    """

    # Only authenticated users are associated with an activity.
    if not getattr(user, "is_authenticated", False):
        user = None

    activity = ActivityLog.objects.create(
        user=user,
        module=module,
        action=action,
        object_id=str(object_id) if object_id is not None else "",
        object_name=str(object_name),
        description=description,
        old_values=old_values or {},
        new_values=new_values or {}
    )

    return activity
