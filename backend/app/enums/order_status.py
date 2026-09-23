from enum import Enum

class OrderStatus(str, Enum):
    RECEIVED = "Received"
    PREPARING = "Preparing"
    READY = "Ready"
    SERVED = "Served"
    CANCELLED = "Cancelled"