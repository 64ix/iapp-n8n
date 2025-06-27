#/bin/bash
# Doc: https://docs.n8n.io/hosting/cli-commands/#credentials

if [ "$1" == "export" ] ; then 
    echo "=== Exporting"
    
    echo "== Export Creds" 
    n8n export:credentials --all --decrypted --output=secrets/n8n-credentials.json

    echo "== Export Workflow"
    n8n export:workflow --all --output=secrets/n8n-workflow.json

elif [ "$1" == "import" ] ; then
    echo "=== Importing"
    echo "== Import Creds"; echo
    n8n import:credentials --input=secrets/n8n-credentials.json

    echo "== Import Workflow"
    n8n import:workflow --input=secrets/n8n-workflow.json
    echo ; echo "== Activating Workflow"
    n8n update:workflow --all --active=true

    echo "Pls Restart : n8n start"

elif [ "$1" == "reset" ] ; then
    echo "=== Reset n8n "
    n8n license:clear

else
    echo "Pls use with args : export / import / reset"

fi 
