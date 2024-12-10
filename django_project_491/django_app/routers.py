class AnnotationRouter:
    """
    A router to control all database operations on models in the
    annotation application.
    """
    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'your_app_name' and model._meta.model_name == 'annotation':
            return 'annotations'
        return 'default'

    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'your_app_name' and model._meta.model_name == 'annotation':
            return 'annotations'
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        return True

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if model_name == 'annotation':
            return db == 'annotations'
        return db == 'default'