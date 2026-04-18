import json
import os


class Entry:
    def __init__(self, name: str, value: str):
        self.name = name
        self.value = value


class Lang:
    def __init__(self, name: str, entries: list[Entry]):
        self.name = name
        self.entries = entries

    def to_dict(self) -> dict:
        return {entry.name: entry.value for entry in self.entries}

    def write(self) -> str:
        return json.dumps(self.to_dict(), indent=4, ensure_ascii=False)


class MC_Tool:
    def __init__(self, projectname: str):
        self.projectname = projectname

    def generate(self, lang: Lang):
        file_path = os.path.join(
            "src",
            "main",
            "resources",
            "assets",
            self.projectname,
            "lang",
            f"{lang.name}.json"
        )

        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(lang.write())
