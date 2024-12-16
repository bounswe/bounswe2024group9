from django.db import models
from django.conf import settings
from pygments.lexer import default


class Annotation(models.Model):
    _id = models.AutoField(primary_key=True)
    text = models.TextField()
    annotation_type = models.CharField(default='wiki', max_length=100)
    language_qid = models.IntegerField(default=0)  # QID of the question example : Q24582
    annotation_starting_point = models.IntegerField(default=0)
    annotation_ending_point = models.IntegerField(default=0)
    annotation_date = models.DateTimeField(auto_now_add=True)
    author_id = models.IntegerField(default=0)
    parent_annotation = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        related_name='child_annotations',
        null=True,
        blank=True
    )

    def __str__(self):
        return self.text

    def get_author(self):
        from django_app.models import User
        try:
            return User.objects.get(user_id=self.author_id)
        except User.DoesNotExist:
            return None