#!/bin/sh

prepareOssUtil() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ ! -f "bin/ossutil64" ]; then
            curl -o bin/ossutil64 http://gosspublic.alicdn.com/ossutil/1.7.5/ossutil64
            chmod u+x bin/ossutil64
        fi

    elif [[ "$OSTYPE" == "darwin"* ]]; then
        if [ ! -f "bin/ossutilmac64" ]; then
            curl -o bin/ossutilmac64 http://gosspublic.alicdn.com/ossutil/1.7.5/ossutilmac64
            chmod u+x bin/ossutilmac64
        fi
    else
        echo "UNKNOWN oss type ${OSTYPE}"
        exit;
    fi
}
prepareOssUtil

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

deployBuild() {
    # build code
    echo "----------------start build ----------------------"
    yarn

    OSS_PUBLIC_PATH=$(git rev-parse --short HEAD)
    echo "OSS_PUBLIC_PATH: $OSS_PUBLIC_PATH"
    yarn build

    if [ $? -ne 0 ]; then
        echo "yarn build faild"
        exit
    fi
    # backup html files
    tar -zcf "$OSS_PUBLIC_PATH.html.tar.gz" --exclude="dist/$OSS_PUBLIC_PATH" --exclude="*.tar.gz" ./dist
    mv -f "$OSS_PUBLIC_PATH.html.tar.gz" ./dist/

    # upload dist to oss
    echo "----------------start upload file to oss----------------------"
    OSSUTIL_CMD=$(pwd)/bin/ossutilmac64
    OSSUTIL_CMD="$OSSUTIL_CMD -i $OSS_ACCESS_KEY_ID -k $OSS_ACCESS_KEY_SECRET -e $OSS_REGION.aliyuncs.com"

    echo $OSSUTIL_CMD
    $OSSUTIL_CMD cp -r -f ./dist/ oss://$OSS_BUCKET/

}

deployBuild
