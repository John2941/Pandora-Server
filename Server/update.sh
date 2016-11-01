#! /bin/bash
FILE=$1
if [ -z "$1" ];then
  echo "Usage: $1 <file>"
  exit 1
fi

if [ -a $FILE ]; then
    echo "Copying `pwd`/$1 -> /usr/bin/$1"
    cp "`pwd`/$1" "/usr/bin/$1"
    echo "Copying $1 -> Johnathan@john-desktop:/cygdrive/f/Coding/Pandora Server/$1"
    scp -P 40022 $1 Johnathan@john-desktop:/cygdrive/f/Coding/Pandora\\\ Server >> /dev/null
    echo "Success."
else
  echo "$1 does not exist."
  exit 1
fi
