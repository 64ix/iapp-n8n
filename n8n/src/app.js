import fs from 'node:fs/promises';
import { IExecDataProtectorDeserializer } from '@iexec/dataprotector-deserializer';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function importN8nData(credentialsPath, workflowsPath) {
  try {
    // Importer les credentials
    await execAsync(`n8n import:credentials --input=${credentialsPath}`);
    console.log(`✅ Credentials importés depuis: ${credentialsPath}`);

    // Importer les workflows
    await execAsync(`n8n import:workflow --input=${workflowsPath}`);
    console.log(`✅ Workflows importés depuis: ${workflowsPath}`);

    console.log('Import terminé avec succès !');
  } catch (error) {
    console.error(`❌ Échec de l'import: ${error.message}`);
    throw error;
  }
}

async function activateAllWorkflows() {
  try {
    // Lister tous les workflows et les activer
    const { stdout } = await execAsync('n8n list:workflow');
    console.log('Liste des workflows disponibles:');
    console.log(stdout);
    
    // Activer tous les workflows
    await execAsync('n8n update:workflow --all --active=true');
    console.log('✅ Tous les workflows activés avec succès');
  } catch (error) {
    console.error(`❌ Échec de l'activation des workflows: ${error.message}`);
    throw error;
  }
}

const main = async () => {
  console.log('Démarrage de script...');
  const { IEXEC_OUT } = process.env;

  let computedJsonObj = {};

    let messages = [];

    // Example of process.argv:
    // [ '/usr/local/bin/node', '/app/src/app.js', 'Bob' ]
    const args = process.argv.slice(2);
    console.log(`Received ${args.length} args`);
    messages.push(args.join(' '));

    try {
      const deserializer = new IExecDataProtectorDeserializer();
      
      // Récupérer les credentials depuis la protected data
      console.log('Récupération des credentials depuis la protected data...');
      const credentials = await deserializer.getValue('credentials', 'string');
      console.log('Credentials récupérés avec succès');
      
      // Récupérer les workflows depuis la protected data
      console.log('Récupération des workflows depuis la protected data...');
      const workflows = await deserializer.getValue('workflow', 'string');
      console.log('Workflows récupérés avec succès');

      // Écrire les données dans des fichiers temporaires
      const credentialsPath = '/tmp/credentials.json';
      const workflowsPath = '/tmp/workflows.json';
      
      await fs.writeFile(credentialsPath, credentials);
      await fs.writeFile(workflowsPath, workflows);
      
      console.log('Fichiers temporaires créés');

      // Importer les données dans n8n
      console.log('Import des données dans n8n...');
      await importN8nData(credentialsPath, workflowsPath);
      
      // Activer tous les workflows
      console.log('Activation de tous les workflows...');
      await activateAllWorkflows();
      
      messages.push('Données n8n importées et tous les workflows activés avec succès');
      
    } catch (e) {
      console.log('Erreur lors de la récupération des données protégées:', e);
      messages.push('Erreur données protégées');
    }
 
};

main();
