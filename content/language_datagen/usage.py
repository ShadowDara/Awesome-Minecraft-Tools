from mc_lib import *

entries = [
    Entry("hello", "Hallo"),
    Entry("bye", "Tschüss")
]

lang = Lang("de_de", entries)
tool = MC_Tool("my_mod")

tool.generate(lang)
