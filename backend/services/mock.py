
import random
def generate_event():
    return {
        "public": random.choice([True, False]),
        "resource": "s3_bucket"
    }
