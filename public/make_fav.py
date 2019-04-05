import os
os.system('wsl mount -t drvfs e: /mnt/e')
for i in ('128', '64', '32', '24', '16'):
    os.system(f'wsl convert -resize {i}x{i} favicon.png icon{i}.png')
# os.remove('favicon.ico')
os.system('wsl convert icon*.png favicon.ico')
for i in ('128', '64', '32', '24', '16'):
    os.remove(f'icon{i}.png')
