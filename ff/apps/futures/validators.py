from django.core.exceptions import ValidationError
from futures.utils import coords_from_address


def validate_address(value):
    try:
        coords_from_address(value)
    except:
        raise ValidationError(u"%s can't be parsed as an address" % value)
