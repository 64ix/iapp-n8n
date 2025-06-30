# TrustFlow 🔒⚡

> **TrustFlow** combine la puissance d'automatisation low-code de n8n avec l'exécution sécurisée et vérifiable des environnements d'exécution de confiance (TEE) d'iExec. Il permet aux utilisateurs de protéger leur logique de workflow, traiter des données confidentielles et même monétiser leur automatisation en tant qu'actifs numériques protégés.

[![TrustFlow Demo](https://img.shields.io/badge/Demo-Video-blue?style=for-the-badge)](https://drive.google.com/file/d/1B8oJ0GgZAaaplOAhgNKRmzS3cAMQqxsm/view)
[![DoraHacks Project](https://img.shields.io/badge/DoraHacks-Project-green?style=for-the-badge)](https://dorahacks.io/buidl/27083)

## 🌟 Aperçu

TrustFlow offre un nouveau standard pour l'automatisation zero-trust, préservant la confidentialité et permettant l'audit, en comblant le fossé entre les outils d'automatisation Web2 et l'écosystème décentralisé Web3.

### 🎯 Fonctionnalités principales

- **🔐 Protection des workflows** : Sécurisez votre logique d'automatisation dans des environnements TEE
- **🛡️ Confidentialité des données** : Traitez des données sensibles de manière sécurisée
- **🔍 Auditabilité** : Exécution vérifiable et transparente
- **🌐 Interface Web** : Interface utilisateur intuitive pour la création de données protégées

## 🏗️ Architecture du projet

Ce repository contient plusieurs composants qui travaillent ensemble pour créer l'écosystème TrustFlow :

```
iapp-n8n/
├── n8n-iapp/                    # Application iExec pour exécuter n8n dans un TEE
├── protectedData_generator/     # Script Node.js pour convertir workflows n8n en données protégées
├── front/                       # Interface frontend pour la création de données protégées
└── n8n-nodes-starter/          # Ébauche pour créer des nœuds dataprotector dans n8n
```

## 📦 Composants

### 1. **n8n-iapp** 🚀
Application iExec qui permet d'exécuter n8n à l'intérieur d'un environnement d'exécution de confiance (TEE).

**Technologies :**
- Node.js
- @iexec/dataprotector-deserializer
- Figlet
- n8n

### 2. **protectedData_generator** 🔧
Script Node.js simple pour convertir un workflow n8n et ses credentials en données protégées.

**Technologies :**
- Node.js
- @iexec/dataprotector

### 3. **front** 🎨
Interface frontend moderne pour créer des données protégées de manière intuitive.

**Technologies :**
- React 18
- TypeScript
- Vite
- @iexec/dataprotector
- ESLint + Prettier

### 4. **n8n-nodes-starter** 🔌
Ébauche pour créer des nœuds dataprotector dans n8n en tant que nœuds communautaires.

**Technologies :**
- TypeScript
- n8n-workflow
- @iexec/dataprotector
- Gulp

## 🚀 Installation et utilisation

### Prérequis

- Node.js >= 20.15
- npm ou yarn
- Compte iExec (pour l'utilisation des TEE)

### Installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd iapp-n8n
```

2. **Installer les dépendances pour chaque composant**

```bash
# Frontend
cd front
npm install

# Protected Data Generator
cd ../protectedData_generator
npm install

# n8n Nodes Starter
cd ../n8n-nodes-starter
npm install

# n8n iApp
cd ../n8n-iapp
npm install
```

### Utilisation

#### Frontend
```bash
cd front
npm run dev
```

#### Protected Data Generator
```bash
cd protectedData_generator
node script.js
```

#### n8n Nodes Starter
```bash
cd n8n-nodes-starter
npm run build
```

## 🔐 Sécurité

TrustFlow utilise les technologies de sécurité les plus avancées :

- **Environnements d'exécution de confiance (TEE)** d'iExec
- **Protection des données** avec @iexec/dataprotector
- **Exécution vérifiable** et transparente
- **Confidentialité préservée** lors du traitement des données


## 🔗 Liens utiles

- **[DoraHacks Project](https://dorahacks.io/buidl/27083)** - Page du projet sur DoraHacks
- **[Demo Video](https://drive.google.com/file/d/1B8oJ0GgZAaaplOAhgNKRmzS3cAMQqxsm/view)** - Vidéo de démonstration
- **[iExec Documentation](https://docs.iex.ec/)** - Documentation officielle iExec
- **[n8n Documentation](https://docs.n8n.io/)** - Documentation officielle n8n


---

**TrustFlow** - Révolutionnant l'automatisation avec la sécurité Web3 🔒⚡
