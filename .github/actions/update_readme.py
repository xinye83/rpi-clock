import os
import subprocess
import re

workspace = os.getenv("GITHUB_WORKSPACE")
if workspace is None:
    workspace = (
        subprocess.check_output("git rev-parse --show-toplevel", shell=True)
        .decode("utf-8")
        .strip("\n")
    )

with open(workspace + "/README.md", "r") as f:
    readme = f.read()

# update bash_history section

with open(workspace + "/rpi-config/.bash_profile") as f:
    bash_profile = f.read()

start = "<!-- bash_profile_start -->\n\n```bash\n"
end = "```\n\n<!-- bash_profile_end -->"

readme = re.sub(
    start + ".*?" + end, start + bash_profile + end, readme, count=1, flags=re.DOTALL
)

# update xinitrc section

with open(workspace + "/rpi-config/.xinitrc") as f:
    xinitrc = f.read()

start = "<!-- xinitrc_start -->\n\n```bash\n"
end = "```\n\n<!-- xinitrc_end -->"

readme = re.sub(
    start + ".*?" + end, start + xinitrc + end, readme, count=1, flags=re.DOTALL
)

# write changes back to READNE.md

with open(workspace + "/README.md", "w") as f:
    f.write(readme)
