import string
import random

def generate_temp_password(length: int = 12) -> str:
    """
    Generate a random temporary password.

    By default, it includes:
    - Uppercase letters
    - Lowercase letters
    - Digits
    - Special symbols

    Args:
    - length: length of the password (default 12)

    Returns:
    - A strong random password string
    """
    characters = string.ascii_letters + string.digits + "!@#$%^&*()-_=+"
    password = ''.join(random.choice(characters) for _ in range(length))
    return password

def is_strong_password(password: str) -> bool:
    """
    Check if the password is strong.

    A strong password must contain:
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    - Minimum length of 8 characters

    Args:
    - password: the password string to check

    Returns:
    - True if the password is strong, False otherwise
    """
    if (len(password) < 8 or
        not any(c.isupper() for c in password) or
        not any(c.islower() for c in password) or
        not any(c.isdigit() for c in password) or
        not any(c in "!@#$%^&*()-_=+" for c in password)):
        return False
    return True

# if __name__ == "__main__":
#     print("Password Generator and Validator")
#     temp_password = generate_temp_password()
#     print(f"Temporary Password: {temp_password}")
#     print(f"Is Strong Password: {is_strong_password(temp_password)}")