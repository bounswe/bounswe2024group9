from django import forms


class code_form(forms.Form):
    ProgrammingLanguage = forms.ChoiceField(choices=[])  # Empty by default
    query = forms.CharField(widget=forms.Textarea(attrs={'rows': 10, 'cols': 80}))

    def __init__(self, *args, **kwargs):
        choices = kwargs.pop('choices', [])  # Extract choices from kwargs
        super(code_form, self).__init__(*args, **kwargs)  # Call the parent constructor
        self.fields['ProgrammingLanguage'].choices = choices  # Set the choices dynamically)
