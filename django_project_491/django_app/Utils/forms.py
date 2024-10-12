from django import forms


class code_form(forms.Form):
    query = forms.CharField(widget=forms.Textarea, label='Enter your code here')
    language_id = forms.IntegerField(widget=forms.NumberInput, label='Enter the language ID')
