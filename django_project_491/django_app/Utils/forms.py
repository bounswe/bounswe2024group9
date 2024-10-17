from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class code_form(forms.Form):
    ProgrammingLanguage = forms.ChoiceField(choices=[])  # Empty by default
    query = forms.CharField(widget=forms.Textarea(attrs={'rows': 10, 'cols': 80}))

    def __init__(self, *args, **kwargs):
        choices = kwargs.pop('choices', [])  # Extract choices from kwargs
        super(code_form, self).__init__(*args, **kwargs)  # Call the parent constructor
        self.fields['ProgrammingLanguage'].choices = choices  # Set the choices dynamically)


class SignupForm(UserCreationForm):
    email = forms.EmailField(required=True)
    usable_password = None
    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

    def save(self, commit=True):
        user = super(SignupForm, self).save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
        return user