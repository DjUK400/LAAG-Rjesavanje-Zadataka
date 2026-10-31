import pathlib
src = pathlib.Path(__file__).parent / "src"
shell = (src / "shell.html").read_text()
js = "\n".join((src / f).read_text() for f in ["core.js", "expr.js", "logika.js", "skupovi.js", "relacije.js", "funkcije.js", "indukcija.js", "main.js"])
css = (src / "style.css").read_text()
out = shell.replace("/*CSS*/", css).replace("/*JS*/", js.replace("</script", "<\\/script"))
(pathlib.Path(__file__).parent / "index.html").write_text(out)
print("index.html", len(out))
