from marshmallow import Schema, fields, validate, validates, ValidationError

class SignupSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)

class ShipmentCreateSchema(Schema):
    # sender fields
    sender_name = fields.Str(required=True)
    sender_address_street = fields.Str(required=True)
    sender_address_city = fields.Str(required=True)
    sender_address_state = fields.Str(required=True)
    sender_address_pincode = fields.Str(required=True)
    sender_address_country = fields.Str(required=True)
    sender_phone = fields.Str(required=True)

    # receiver fields
    receiver_name = fields.Str(required=True)
    receiver_address_street = fields.Str(required=True)
    receiver_address_city = fields.Str(required=True)
    receiver_address_state = fields.Str(required=True)
    receiver_address_pincode = fields.Str(required=True)
    receiver_address_country = fields.Str(required=True)
    receiver_phone = fields.Str(required=True)

    # package info
    package_weight_kg = fields.Float(required=True)
    package_width_cm = fields.Float(required=True)
    package_height_cm = fields.Float(required=True)
    package_length_cm = fields.Float(required=True)
    pickup_date = fields.Date(required=True)
    service_type = fields.Str(required=True, validate=validate.OneOf(["Standard", "Express"]))

    # Add user_email field to the schema
    user_email = fields.Email(required=True)  # Add this line
