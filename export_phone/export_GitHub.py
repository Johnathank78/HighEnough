import os 
import shutil
import fileinput
import hashlib
import time
import re
import html

with open(os.path.join("C:\\Users\\johna\\Desktop\\NOEMIE\\webApp\\", "service-worker.js"), "r") as output:
    sw_data = output.read()
    
    match = re.search(r"app-cache-v(\d+\.\d+)", sw_data)
    version = match.group(1)
    versionSplit = version.split('.')
    
    if versionSplit[1] == "99":
        versionSplit[0] = int(versionSplit[0]) + 1
        versionSplit[1] = 0
    else:
        versionSplit[1] = int(versionSplit[1]) + 1

    sw_data = sw_data.replace(f"{match.group(0)}", f"app-cache-v{versionSplit[0]}.{versionSplit[1]}")
        
with open(os.path.join("C:\\Users\\johna\\Desktop\\NOEMIE\\webApp\\", "service-worker.js"), "w") as output:
    output.write(sw_data)