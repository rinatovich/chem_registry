from .common import *
from .core import ChemicalElement, ElementAttachment
from .identification import Sec1Identification
from .physical import Sec2Physical
from .properties import (
    Sec3ToxSanPin, Sec4ToxAir, Sec5ToxAcute, Sec6ToxRisks,
    Sec8EcoTox, Sec9Soil, Sec10Water,
    Sec11HazardClass, Sec12GHSClass, Sec13GHSLabel,
    Sec14Safety, Sec15Storage, Sec16Waste, Sec17Incidents,
    Sec18InternationalReg, Sec20Docs, Sec21Companies, Sec22Volumes, Sec23Extra
)