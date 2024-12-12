class AnnotationRouter:
    """
    A router to control all database operations on models in the annotations_app.
    """
    route_app_labels = {'annotations_app'}

    def db_for_read(self, model, **hints):
        if model._meta.app_label in self.route_app_labels:
            return 'annotations'
        return 'default'

    def db_for_write(self, model, **hints):
        if model._meta.app_label in self.route_app_labels:
            return 'annotations'
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if both objects are in the same app or database.
        Prevent relations across different databases.
        """
        if (
            obj1._meta.app_label in self.route_app_labels and
            obj2._meta.app_label in self.route_app_labels
        ):
            # Both models are in annotations_app
            return True
        elif (
            obj1._meta.app_label not in self.route_app_labels and
            obj2._meta.app_label not in self.route_app_labels
        ):
            # Both models are in the default app
            return True
        return False  # Disallow relations across different apps/databases

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label in self.route_app_labels:
            return db == 'annotations'
        return db == 'default'
