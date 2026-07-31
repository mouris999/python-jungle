"""
jungle_tools — Python Jungle utility module

This module provides helper functions used in the Python Jungle
learning platform. It's also created in-memory by the Pyodide
engine so exercises can import it without a real file.
"""

__version__ = "1.0.0"


def jungle_greeting(name):
    """Return a jungle-themed greeting for the given name.

    Args:
        name: A string with the explorer's name.

    Returns:
        A greeting string like "Hello, Explorer!"
    """
    return "Hello, " + name + "!"


def animal_sound(animal):
    """Return the sound a jungle animal makes.

    Args:
        animal: Lowercase animal name.

    Returns:
        The sound the animal makes, or "???" if unknown.
    """
    sounds = {
        "tiger": "Roar!",
        "elephant": "Trumpet!",
        "monkey": "Ook ook!",
        "parrot": "Squawk!",
        "snake": "Hiss!",
        "frog": "Ribbit!",
        "owl": "Hoo hoo!",
        "jaguar": "Growl!",
        "bear": "Grrr!",
        "fox": "Ring-ding-ding!",
    }
    return sounds.get(animal.lower(), "???")


def tree_count(trees_per_acre, acres):
    """Calculate total number of trees in a given area.

    Args:
        trees_per_acre: Number of trees per acre (int or float).
        acres: Number of acres (int or float).

    Returns:
        Total tree count as an integer.
    """
    return int(trees_per_acre * acres)