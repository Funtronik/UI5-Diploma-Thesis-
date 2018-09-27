#!/usr/bin/env python
import sys
import os
import git
import shutil
from git import Repo

repoPath = "https://github.com/Funtronik/Ui5.git"
ui5folder = '/var/www/html/Ui5'

def deleteFirst():
    path = '/var/www/html'
    os.system("sudo chmod o+w /var/www")
    shutil.rmtree(path)
    os.makedirs(path)
            
def unpackFiles():
    dest = '/var/www/html'
    files = os.listdir(ui5folder)
    for f in files:
        shutil.move(ui5folder+"/"+f, dest)
    shutil.rmtree(ui5folder)

if os.path.isdir(ui5folder):
    deleteFirst()
    
    git.Git("/var/www/html").clone(repoPath)
    unpackFiles()
    print("Deleted and Imported")
