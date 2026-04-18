import argparse
from mc_lang_datagen.core import Entry, Lang, MC_Tool


def main():
    parser = argparse.ArgumentParser(description="Minecraft lang generator")

    parser.add_argument("--project", required=True)
    parser.add_argument("--lang", required=True)

    parser.add_argument("--entry", action="append", nargs=2, metavar=("KEY", "VALUE"))

    args = parser.parse_args()

    entries = [Entry(k, v) for k, v in args.entry]

    lang = Lang(args.lang, entries)
    tool = MC_Tool(args.project)

    tool.generate(lang)

    print(f"Generated {args.lang}.json for {args.project}")


if __name__ == "__main__":
    main()
