![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-iexec

Ce package contient des nœuds personnalisés pour n8n, incluant un nœud pour interagir avec iExec DataProtector.

## Nœuds inclus

### IExecDataProtectorNode

Un nœud pour protéger et gérer des données avec iExec DataProtector. Ce nœud permet de :

- **Protect Data** : Protéger des données en les chiffrant
- **Get Protected Data** : Récupérer la liste des données protégées
- **Grant Access** : Accorder l'accès à une application
- **Get Granted Access** : Récupérer la liste des accès accordés
- **Revoke Access** : Révoquer un accès

## Installation

### Installation locale pour le développement

1. Clonez ce repository
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Compilez le projet :
   ```bash
   npm run build
   ```
4. Créez un package local :
   ```bash
   npm pack
   ```
5. Installez le package dans n8n :
   ```bash
   npm install ./n8n-nodes-iexec-0.1.0.tgz
   ```

### Configuration des credentials

Pour utiliser le nœud IExecDataProtector, vous devez configurer des credentials avec votre clé privée Ethereum :

1. Dans n8n, allez dans **Settings** > **Credentials**
2. Cliquez sur **Add Credential**
3. Sélectionnez **iExec DataProtector API**
4. Entrez votre clé privée Ethereum
5. Sauvegardez les credentials

## Utilisation

### Protect Data

Pour protéger des données :

1. Ajoutez le nœud **iExec DataProtector** à votre workflow
2. Sélectionnez l'opération **Protect Data**
3. Entrez les données à protéger au format JSON
4. Optionnellement, ajoutez un nom pour identifier les données
5. Configurez les credentials iExec DataProtector API

### Get Protected Data

Pour récupérer la liste des données protégées :

1. Sélectionnez l'opération **Get Protected Data**
2. Optionnellement, spécifiez une adresse de propriétaire
3. Optionnellement, spécifiez un schéma de données pour filtrer

### Grant Access

Pour accorder l'accès à une application :

1. Sélectionnez l'opération **Grant Access**
2. Entrez l'adresse des données protégées
3. Entrez l'adresse de l'application iExec
4. Optionnellement, spécifiez une adresse d'utilisateur

## Développement

### Structure du projet

```
├── nodes/
│   └── IExecDataProtectorNode/
│       └── IExecDataProtectorNode.node.ts
├── credentials/
│   └── IExecDataProtectorApi.credentials.ts
├── dist/          # Fichiers compilés
├── package.json
└── index.js       # Point d'entrée
```

### Scripts disponibles

- `npm run build` : Compile le projet
- `npm run dev` : Compilation en mode watch
- `npm run lint` : Vérification du code
- `npm run format` : Formatage du code

## Dépendances

- `@iexec/dataprotector` : SDK iExec DataProtector
- `n8n-workflow` : Types et utilitaires n8n

## Licence

MIT
