#!/bin/sh

# flatten ENV
ENV_FILE="./bin/example.${NODE_ENV}.env"
OSS_KEY_FILE="./bin/.oss_key"

if [ -f "${ENV_FILE}" ]; then
    export $(cat ${ENV_FILE} | sed 's/#.*//g' | xargs)
    rm .env
    ln -s "${ENV_FILE}" .env
else
    echo "ERROR: NODE_ENV must be set
    example: NODE_ENV=rc bin/publish.sh"
    exit
fi
echo "NODE_ENV = ${NODE_ENV}"

# load OSS_ACCESS_KEY_ID & OSS_ACCESS_KEY_SECRET from file
if [ -f "${OSS_KEY_FILE}" ]; then
    export $(cat ${OSS_KEY_FILE} | sed 's/#.*//g' | xargs)
else
    echo "ERROR: ${OSS_KEY_FILE} not exist, you must set oss access key id and secret in file ${OSS_KEY_FILE}"
    exit
fi

if [ ! "$VERSION" ]; then
    echo "ERROR: NODE_ENV and VERSION must be set.
     example: NODE_ENV=rc VERSION=01231 bin/restore.sh"
    exit
fi

echo "NODE_ENV = ${NODE_ENV}"
echo "VERSION = ${VERSION}"

OSSUTIL_CMD=$(pwd)/bin/ossutilmac64
OSSUTIL_CMD="$OSSUTIL_CMD -i $OSS_ACCESS_KEY_ID -k $OSS_ACCESS_KEY_SECRET -e $OSS_REGION.aliyuncs.com"
echo $OSSUTIL_CMD

# restore html files
rm -rf bin/tmp/ && mkdir bin/tmp/
$OSSUTIL_CMD cp -rf "oss://$OSS_BUCKET/$VERSION.html.tar.gz" bin/tmp/

if [ $? -ne 0 ]; then
    echo "copy file from oss faild"
    exit
fi

tar -zxvf "bin/tmp/$VERSION.html.tar.gz" -C bin/tmp/
$OSSUTIL_CMD cp -rf ./bin/tmp/dist/ oss://$OSS_BUCKET/
# $OSSUTIL_CMD sync -f -u ./bin/tmp/dist/ oss://$OSS_BUCKET/
rm -rf bin/tmp/
