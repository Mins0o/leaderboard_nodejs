from prompt_toolkit.shortcuts import checkboxlist_dialog, button_dialog
from datetime import datetime

import json

def select_suggestions(input_data):
    suggestionIndicesList = checkboxlist_dialog(
        title = "Suggestion Screening",
        text = "Select the suggestions to apply",
        values = [(ii, f"{suggestion}") for ii, suggestion in enumerate(input_data["match_suggestion"])]
    ).run()
    if suggestionIndicesList:
        suggestionList = [input_data["match_suggestion"][ii] for ii in suggestionIndicesList]
        return suggestionList, suggestionIndicesList
    exit(0)


def list_display_string(list):
    display_text = "\n"
    for item in list:
        display_text += f'{item}'
        display_text += "\n"
    return display_text

def get_confirmation(query_text):
    confirmation = button_dialog(
        title='Confirm',
        text=query_text,
        buttons=[
            ('Yes', True),
            ('No', False)
        ],
    ).run()
    return confirmation

def apply_suggestion(input_data):
    suggestionList, suggestionIndicesList = select_suggestions(input_data)

    selections_text = list_display_string(suggestionList)
    existing_tail = list_display_string(input_data["match_data"][-2:])

    query_text = f"Your selection {selections_text} will be added after {existing_tail}"+"""
"""+"Is that okay?"
    confirmation = get_confirmation(query_text)
    
    if confirmation:
        last_index = input_data["match_data"][-1]["index"]
        for ii, addition in enumerate(suggestionList):
            last_index += 1
            addition["index"] = last_index
            input_data["match_data"].append(addition)
            input_data["match_suggestion"].pop(suggestionIndicesList[-ii-1])
        return input_data
    exit()
    
def delete_suggestion(input_data):
    suggestionList, suggestionIndicesList = select_suggestions(input_data)

    selections_text = list_display_string(suggestionList)

    query_text = f"Your selection {selections_text} will be deleted"+"""
"""+"Is that okay?"
    confirmation = get_confirmation(query_text)
    
    if confirmation:
        for ii in range(len(suggestionList)):
            input_data["match_suggestion"].pop(suggestionIndicesList[-ii-1])
        return input_data
    exit()

if __name__ == "__main__":
    with open("data.json","r") as data_file:
        data = json.load(data_file)

    choice = button_dialog(
        title='Choose Action',
        text="What would you like to do to the suggestions?",
        buttons=[
            ('Apply', "apply"),
            ('Delete', "delete"),
            ('nothing', '')
        ],
    ).run()

    if choice == "apply":
        data = apply_suggestion(data)
    elif choice == "delete":
        data = delete_suggestion(data)
    else:
        with open(f".data_backup/.data.json.bak.{datetime.now().strftime('%m%d_%H_%M_%S')}", "w") as write_file:
            json.dump(data, write_file, indent=2, ensure_ascii=False)
        exit(0)


    
    with open(f"data.json", "w") as write_file:
        json.dump(data, write_file, indent=2, ensure_ascii=False)
    
    print(json.dumps(data, indent=2, ensure_ascii=False))