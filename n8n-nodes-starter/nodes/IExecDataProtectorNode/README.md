# IExecDataProtector Node

Ce nœud permet d'interagir avec iExec DataProtector pour protéger et gérer des données de manière sécurisée.

## Fonctionnalités

### Opérations disponibles

1. **Protect Data** : Chiffre et protège des données
2. **Get Protected Data** : Récupère la liste des données protégées
3. **Grant Access** : Accorde l'accès à une application
4. **Get Granted Access** : Récupère la liste des accès accordés
5. **Revoke Access** : Révoque un accès

## Configuration

### Credentials requis

Vous devez configurer des credentials **iExec DataProtector API** avec :
- **Private Key** : Votre clé privée Ethereum pour signer les transactions

### Paramètres par opération

#### Protect Data
- **Data to Protect** : Les données à protéger au format JSON
- **Data Name** (optionnel) : Nom pour identifier les données

#### Get Protected Data
- **Owner Address** (optionnel) : Adresse du propriétaire des données
- **Data Schema** (optionnel) : Schéma des données pour filtrer

#### Grant Access
- **Protected Data Address** : Adresse des données protégées
- **Application Address** : Adresse de l'application iExec
- **User Address** (optionnel) : Adresse de l'utilisateur

#### Get Granted Access
- **Protected Data Address** : Adresse des données protégées

#### Revoke Access
- **Protected Data Address** : Adresse des données protégées
- **Application Address** : Adresse de l'application à révoquer
- **User Address** (optionnel) : Adresse de l'utilisateur

## Exemples d'utilisation

### Protéger des données

```json
{
  "name": "user_profile",
  "email": "user@example.com",
  "age": 30,
  "preferences": {
    "theme": "dark",
    "language": "fr"
  }
}
```

### Accorder l'accès

1. Récupérez l'adresse des données protégées depuis l'opération "Protect Data"
2. Utilisez cette adresse dans l'opération "Grant Access"
3. Spécifiez l'adresse de l'application iExec qui doit avoir accès

## Retour des données

Chaque opération retourne un objet avec :
- `operation` : Le nom de l'opération exécutée
- `result` : Le résultat de l'opération
- `success` : `true` si l'opération a réussi, `false` sinon
- `error` : Message d'erreur en cas d'échec

## Gestion des erreurs

Le nœud gère automatiquement les erreurs et peut :
- Continuer l'exécution en cas d'erreur (si configuré)
- Retourner des informations d'erreur détaillées
- Maintenir la compatibilité avec les workflows n8n

## Sécurité

- Les clés privées sont stockées de manière sécurisée dans les credentials
- Les données sont chiffrées avant d'être envoyées à iExec
- L'authentification se fait via des signatures cryptographiques

## Documentation

Pour plus d'informations sur iExec DataProtector, consultez la [documentation officielle](https://tools.docs.iex.ec/tools/dataProtector/getting-started). 
