import graphene as gql
from enum import Enum

class Gender(Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"

GenderType = gql.Enum.from_enum(Gender)