# Commandes à exécuter manuellement

Ce fichier liste toutes les commandes qui nécessitent des interactions manuelles ou une configuration de votre part.

## 1. Configuration de la base de données Neon DB

Avant de continuer, vous devez:

1. Créer un compte sur [Neon DB](https://neon.tech)
2. Créer un nouveau projet/base de données
3. Copier la connection string fournie

Ensuite, mettez à jour le fichier `.env`:

```bash
DATABASE_URL="votre-connection-string-neon-db-ici"
```

## 2. Générer le client Prisma

```bash
pnpm prisma:generate
```

Cette commande génère le client Prisma basé sur votre schéma.

## 3. Créer et exécuter les migrations

```bash
pnpm prisma:migrate
```

Cette commande va:
- Créer les tables dans votre base de données
- Vous demander de nommer la migration (par exemple: "init")

Tapez un nom comme: `init` ou `initial_setup`

## 4. (Optionnel) Peupler la base de données avec des données de test

```bash
pnpm seed
```

Cette commande va créer:
- 3 clés API de test
- 10 transferts d'exemple
- Logs d'audit correspondants

## 5. Démarrer l'application

```bash
pnpm start:dev
```

L'application démarrera en mode développement avec rechargement automatique.

Une fois démarrée, vous verrez:
```
Application is running on: http://localhost:3000
Swagger documentation available at: http://localhost:3000/docs
```

## 6. Tester l'API

Ouvrez votre navigateur et allez sur:
```
http://localhost:3000/docs
```

Vous verrez l'interface Swagger où vous pouvez tester tous les endpoints.

### Pour tester avec Swagger:

1. Cliquez sur le bouton "Authorize" en haut à droite
2. Entrez une clé API valide: `test-api-key-123`
3. Cliquez sur "Authorize" puis "Close"
4. Essayez de créer un transfert via l'endpoint POST /transfers

### Exemple de requête avec curl:

```bash
curl -X POST http://localhost:3000/transfers \
  -H "Content-Type: application/json" \
  -H "x-api-key: test-api-key-123" \
  -d '{
    "amount": 12500,
    "currency": "XOF",
    "channel": "WAVE",
    "recipient": {
      "phone": "+221770000000",
      "name": "Jane Doe"
    },
    "metadata": {
      "orderId": "ABC-123"
    }
  }'
```

## 7. Lancer les tests

### Tests unitaires:
```bash
pnpm test
```

### Tests e2e:
```bash
pnpm test:e2e
```

## 8. (Optionnel) Ouvrir Prisma Studio

Pour visualiser et éditer les données de votre base de données:

```bash
pnpm prisma:studio
```

Cela ouvrira une interface web sur http://localhost:5555

## 9. (Optionnel) Docker

Si vous voulez utiliser Docker:

### Avec la base de données locale PostgreSQL:
```bash
docker-compose up -d
```

### Avec Neon DB:
1. Éditez `docker-compose.yml`
2. Commentez la section `postgres` service
3. Assurez-vous que DATABASE_URL pointe vers Neon DB dans `.env`
4. Lancez:
```bash
docker-compose up -d
```

## Résumé de l'ordre d'exécution:

1. Configurer DATABASE_URL dans .env
2. `pnpm prisma:generate`
3. `pnpm prisma:migrate` (et nommer la migration)
4. `pnpm seed` (optionnel)
5. `pnpm start:dev`
6. Ouvrir http://localhost:3000/docs
7. Tester l'API

## Clés API disponibles après le seed:

- `test-api-key-123` (Test API Key)
- `dev-api-key-456` (Development API Key)
- `prod-api-key-789` (Production API Key)

## Endpoints disponibles:

- **POST /transfers** - Créer un transfert
- **GET /transfers** - Lister les transferts (avec pagination et filtres)
- **GET /transfers/:id** - Récupérer un transfert
- **POST /transfers/:id/process** - Traiter un transfert ⚠️
- **POST /transfers/:id/cancel** - Annuler un transfert

### ⚠️ Important: Process endpoint

Le endpoint `/transfers/:id/process` simule un traitement réel avec:
- **70% de succès** → Status `SUCCESS` + `providerRef`
- **30% d'échec** → Status `FAILED` + `errorCode`
- **2-3 secondes** de délai

**Si un transfert échoue (FAILED)**, il devient définitif et ne peut plus être retraité.

**Solution**: Utilisez un autre transfert PENDING. Le seed crée **10 transferts PENDING** spécifiquement pour tester cet endpoint plusieurs fois.

**Pour lister les transferts PENDING**:
```bash
GET /transfers?status=PENDING
```

Toute la documentation détaillée est disponible dans README.md
