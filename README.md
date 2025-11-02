# API de Gestion de Transferts

> 🇫🇷 Version française | [🇬🇧 English version](./README_EN.md)

Une API RESTful complète pour la gestion de transferts d'argent avec support de multiples canaux de paiement (WAVE, Orange Money, Free Money, Moov Money). Développée avec NestJS, Prisma et PostgreSQL (Neon DB).

## Fonctionnalités

### Fonctionnalités métier
- **Authentification par clé API** : Sécurisation des endpoints via clé API dans les headers
- **Gestion des transferts** : Créer, récupérer, traiter et annuler des transferts
- **Multiples canaux de paiement** : Support pour WAVE, Orange Money, Free Money et Moov Money
- **Règles métier** : Calcul automatique des frais (0,8%, min 100, max 1500 XOF)
- **Gestion d'états** : Transitions d'états contrôlées (PENDING → PROCESSING → SUCCESS/FAILED)
- **Logs d'audit** : Traçabilité complète de toutes les opérations
- **Pagination par cursor** : Pagination efficace avec capacités de filtrage
- **Simulation de provider** : Simulation réaliste du traitement (70% de succès)

### Best Practices & Qualité (2024-2025)
- **TypeScript Strict Mode** : Type safety à 100% avec configuration stricte
- **Validation d'environnement** : Validation Joi des variables d'environnement au démarrage
- **Gestion globale des exceptions** : Filtres personnalisés pour erreurs HTTP et Prisma
- **Health Checks** : Endpoint `/health` pour monitoring de l'état de l'application et de la DB
- **Rate Limiting** : Protection contre les abus avec limitation de débit
- **Logging centralisé** : Intercepteur pour logs de toutes les requêtes HTTP
- **Correlation IDs** : Traçabilité des requêtes avec identifiants de corrélation
- **Validateurs personnalisés** : Validation métier (téléphone E.164, devises)
- **Pre-commit Hooks** : Husky + lint-staged pour qualité du code
- **Organisation des imports** : ESLint avec tri automatique des imports

### Documentation & Tests
- **Documentation Swagger** : Documentation interactive à `/docs`
- **Tests unitaires & E2E** : Couverture de tests complète
- **Support Docker** : Prêt pour déploiement conteneurisé

## Stack Technique

- **Framework** : NestJS 11
- **Langage** : TypeScript (Strict Mode)
- **Base de données** : PostgreSQL (Neon DB)
- **ORM** : Prisma 5
- **Validation** : class-validator, class-transformer, Joi
- **Configuration** : @nestjs/config avec validation d'environnement
- **Monitoring** : @nestjs/terminus (health checks)
- **Sécurité** : @nestjs/throttler (rate limiting)
- **Documentation** : Swagger/OpenAPI
- **Tests** : Jest, Supertest
- **Qualité du code** : ESLint, Prettier, Husky, lint-staged
- **Gestionnaire de paquets** : pnpm

## Prérequis

- Node.js 20+
- pnpm (ou npm/yarn)
- Base de données PostgreSQL (compte Neon DB recommandé)

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/Cheeikh/test-backend-dexchange-nestJs.git
cd test-backend-dexchange-nestJs
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configuration de l'environnement

Copier `.env.example` vers `.env` et configurer vos variables d'environnement :

```bash
cp .env.example .env
```

Mettre à jour le fichier `.env` avec votre configuration :

```env
# Application
NODE_ENV=development
PORT=3000

# Base de données (Neon DB)
DATABASE_URL="postgresql://user:password@host.neon.tech:5432/transferdb?sslmode=require"

# Base de données de test (optionnel, pour tests E2E)
DATABASE_URL_TEST="postgresql://user:password@host.neon.tech:5432/transferdb_test?sslmode=require"

# Clés API (séparées par des virgules)
API_KEYS="test-api-key-123,dev-api-key-456"

# Configuration des transferts
DEFAULT_CURRENCY=XOF
FEE_PERCENTAGE=0.8
MIN_FEE=100
MAX_FEE=1500

# Simulation Provider
SUCCESS_RATE=0.7
```

### 4. Configuration de la base de données

Générer le client Prisma :

```bash
pnpm prisma:generate
```

Exécuter les migrations :

```bash
pnpm prisma:migrate
```

Peupler la base de données avec des données de test :

```bash
pnpm seed
```

### 5. Démarrer l'application

Mode développement :

```bash
pnpm start:dev
```

Mode production :

```bash
pnpm build
pnpm start:prod
```

L'API sera disponible sur `http://localhost:3000`

Documentation Swagger : `http://localhost:3000/docs`

## Endpoints de l'API

Tous les endpoints (sauf `/health`) nécessitent le header `x-api-key` pour l'authentification.

### Health Check

```http
GET /health
```

Endpoint de vérification de santé de l'application et de la base de données. **Ne nécessite pas d'authentification**.

**Réponse** (200 OK) :

```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    }
  }
}
```

### Créer un transfert

```http
POST /transfers
Content-Type: application/json
x-api-key: test-api-key-123

{
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
}
```

**Réponse** (201 Created) :

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "reference": "TRF-20250101-AB12",
  "amount": 12500,
  "currency": "XOF",
  "channel": "WAVE",
  "status": "PENDING",
  "fees": 100,
  "total": 12600,
  "recipientPhone": "+221770000000",
  "recipientName": "Jane Doe",
  "metadata": { "orderId": "ABC-123" },
  "createdAt": "2025-01-01T10:00:00.000Z",
  "updatedAt": "2025-01-01T10:00:00.000Z"
}
```

### Lister les transferts

```http
GET /transfers?status=PENDING&channel=WAVE&limit=20&cursor=base64cursor
x-api-key: test-api-key-123
```

**Paramètres de requête** :
- `status` : Filtrer par statut (PENDING, PROCESSING, SUCCESS, FAILED, CANCELED)
- `channel` : Filtrer par canal (WAVE, ORANGE_MONEY, FREE_MONEY, MOOV_MONEY)
- `minAmount` : Montant minimum
- `maxAmount` : Montant maximum
- `q` : Rechercher dans la référence ou le nom du destinataire
- `limit` : Résultats par page (max 50, défaut 20)
- `cursor` : Curseur pour la pagination

**Réponse** (200 OK) :

```json
{
  "items": [
    {
      "id": "...",
      "reference": "TRF-20250101-AB12",
      "amount": 12500,
      "status": "PENDING",
      ...
    }
  ],
  "nextCursor": "base64-encoded-cursor"
}
```

### Récupérer un transfert par ID

```http
GET /transfers/:id
x-api-key: test-api-key-123
```

**Réponse** (200 OK) : Objet transfert

### Traiter un transfert

```http
POST /transfers/:id/process
x-api-key: test-api-key-123
```

**⚠️ Important** : Cet endpoint simule un traitement réel de provider avec :
- **70% de taux de succès** → Le statut devient `SUCCESS` avec un `providerRef`
- **30% de taux d'échec** → Le statut devient `FAILED` avec un `errorCode`
- **Délai de 2-3 secondes** pour simuler le temps de traitement réel

**Réponse** (200 OK) : Transfert mis à jour avec statut `SUCCESS` ou `FAILED`

**Exemple de succès** :
```json
{
  "id": "...",
  "status": "SUCCESS",
  "providerRef": "WAVE-1730461234-XY7K",
  "errorCode": null
}
```

**Exemple d'échec** :
```json
{
  "id": "...",
  "status": "FAILED",
  "providerRef": null,
  "errorCode": "PROVIDER_TIMEOUT"
}
```

**Note** : Si un transfert échoue, il devient définitif et ne peut plus être traité. Utilisez un autre transfert PENDING pour tester à nouveau. Le seed crée 10 transferts PENDING pour les tests.

### Annuler un transfert

```http
POST /transfers/:id/cancel
x-api-key: test-api-key-123
```

Seuls les transferts PENDING peuvent être annulés.

**Réponse** (200 OK) : Transfert mis à jour avec statut CANCELED

## Règles métier

### Calcul des frais

Les frais sont calculés comme suit :
- **Taux** : 0,8% du montant du transfert (arrondi au supérieur)
- **Minimum** : 100 XOF
- **Maximum** : 1500 XOF

Exemples :
- Montant : 5 000 → Frais : 100 (minimum appliqué)
- Montant : 12 500 → Frais : 100 (0,8% = 100)
- Montant : 50 000 → Frais : 400 (0,8% = 400)
- Montant : 300 000 → Frais : 1 500 (maximum appliqué)

### Flux des états

```
PENDING → PROCESSING → SUCCESS | FAILED
   ↓
CANCELED
```

- **PENDING** : Transfert créé, en attente de traitement
- **PROCESSING** : Transfert en cours de traitement par le provider (prend 2-3 secondes)
- **SUCCESS** : Transfert réussi (**70% de probabilité** en simulation)
- **FAILED** : Transfert échoué (**30% de probabilité** en simulation)
- **CANCELED** : Transfert annulé par l'utilisateur (uniquement depuis l'état PENDING)

**⚠️ Important** : Les états finaux (SUCCESS, FAILED, CANCELED) ne peuvent pas être modifiés ou retraités.

**Pour les tests** : Si un transfert échoue pendant le traitement, vous devez utiliser un autre transfert PENDING pour tester à nouveau. Le script de seed crée **10 transferts PENDING** spécifiquement pour tester l'endpoint process plusieurs fois.

### Génération de référence

Format : `TRF-AAAAMMJJ-XXXX`

Exemple : `TRF-20250101-AB12`

## Tests

### Exécuter les tests unitaires

```bash
pnpm test
```

### Exécuter les tests e2e

```bash
pnpm test:e2e
```

### Exécuter les tests avec couverture

```bash
pnpm test:cov
```

### Tests manuels via Swagger

Le script de seed crée **10 transferts PENDING** pour faciliter les tests. Accédez à Swagger sur `http://localhost:3000/docs`.

**Tester l'endpoint process** :

1. Obtenir une liste des transferts PENDING :
   ```
   GET /transfers?status=PENDING
   ```

2. Copier un ID de la réponse

3. Traiter le transfert :
   ```
   POST /transfers/{id}/process
   ```

4. **Si SUCCESS** (70% de chance) :
   - Le statut passe à `SUCCESS`
   - Un `providerRef` est généré (ex: `WAVE-1730461234-XY7K`)
   - Le transfert est terminé

5. **Si FAILED** (30% de chance) :
   - Le statut passe à `FAILED`
   - Un `errorCode` est défini (ex: `PROVIDER_TIMEOUT`)
   - Le transfert ne peut pas être retraité
   - **Utiliser un autre transfert PENDING** de l'étape 1

**Astuce** : Avec 10 transferts PENDING, vous pouvez tester l'endpoint process plusieurs fois même si certains échouent.

## Déploiement Docker

### Avec docker-compose (PostgreSQL local)

```bash
docker-compose up -d
```

### Avec docker-compose (Neon DB)

1. Mettre à jour `.env` avec votre chaîne de connexion Neon DB
2. Commenter le service `postgres` dans `docker-compose.yml`
3. Mettre à jour les dépendances du service `app`

```bash
docker-compose up -d
```

### Construire uniquement l'image Docker

```bash
docker build -t transfer-api .
```

## Structure du projet

```
src/
├── common/
│   ├── guards/
│   │   └── api-key.guard.ts       # Guard d'authentification API key
│   ├── decorators/                # Décorateurs personnalisés
│   ├── filters/
│   │   ├── all-exceptions.filter.ts    # Filtre global d'exceptions
│   │   └── prisma-exception.filter.ts  # Filtre d'exceptions Prisma
│   ├── interceptors/
│   │   └── logging.interceptor.ts      # Intercepteur de logging HTTP
│   ├── middleware/
│   │   └── correlation-id.middleware.ts # Middleware correlation ID
│   └── validators/
│       ├── is-phone-number.validator.ts # Validateur téléphone E.164
│       └── is-valid-currency.validator.ts # Validateur devise
├── config/
│   ├── configuration.ts           # Factory de configuration
│   └── env.validation.ts          # Schéma de validation Joi
├── transfers/
│   ├── dto/
│   │   ├── create-transfer.dto.ts # DTO de création de transfert
│   │   ├── list-transfers.dto.ts  # DTOs de requête & filtres
│   │   └── transfer-response.dto.ts # DTOs de réponse
│   ├── transfers.controller.ts    # Endpoints REST
│   ├── transfers.service.ts       # Logique métier
│   ├── transfers.repository.ts    # Couche d'accès aux données
│   ├── transfers.module.ts        # Définition du module
│   └── provider.simulator.ts      # Simulation de provider de paiement
├── audit/
│   ├── audit.service.ts           # Service de logs d'audit
│   └── audit.module.ts            # Définition du module
├── health/
│   ├── health.controller.ts       # Endpoint health check
│   ├── prisma-health.indicator.ts # Indicateur santé Prisma
│   └── health.module.ts           # Définition du module
├── prisma/
│   ├── prisma.service.ts          # Service client Prisma
│   └── prisma.module.ts           # Définition du module (global)
├── app.module.ts                  # Module racine
└── main.ts                        # Bootstrap de l'application
prisma/
├── schema.prisma                  # Schéma de base de données
└── seed.ts                        # Script de peuplement
test/
├── app.e2e-spec.ts               # Tests e2e de l'app
└── transfers.e2e-spec.ts         # Tests e2e des transferts
.husky/
└── pre-commit                     # Hook pre-commit Husky
```

## Scripts disponibles

```bash
# Développement
pnpm start:dev          # Démarrer en mode watch
pnpm start:debug        # Démarrer en mode debug

# Build & Production
pnpm build              # Construire l'application
pnpm start:prod         # Démarrer le serveur de production

# Base de données
pnpm prisma:generate    # Générer le client Prisma
pnpm prisma:migrate     # Exécuter les migrations
pnpm prisma:studio      # Ouvrir Prisma Studio
pnpm seed               # Peupler la base avec des données de test

# Tests
pnpm test               # Exécuter les tests unitaires
pnpm test:watch         # Exécuter les tests en mode watch
pnpm test:cov           # Exécuter les tests avec couverture
pnpm test:e2e           # Exécuter les tests e2e

# Qualité du code
pnpm lint               # Linter le code
pnpm format             # Formater le code avec Prettier
```

## Choix techniques

### Pourquoi NestJS ?

- **Architecture modulaire** : Séparation claire des préoccupations avec les modules
- **TypeScript first** : Typage fort et meilleure expérience développeur
- **Validation intégrée** : Intégration transparente avec class-validator
- **Injection de dépendances** : Tests et maintenabilité facilités
- **Intégration Swagger** : Documentation API auto-générée

### Pourquoi Prisma ?

- **Requêtes type-safe** : Types générés depuis le schéma
- **Gestion des migrations** : Contrôle de version pour le schéma de base de données
- **Support multi-bases** : Facile de changer de base de données
- **Excellente expérience développeur** : API de requêtes intuitive

### Pourquoi la pagination par curseur ?

- **Performance** : Plus efficace pour les grands ensembles de données
- **Cohérence** : Pas d'éléments manquants/dupliqués pendant la pagination
- **Scalabilité** : Fonctionne bien avec des données en temps réel

### Pattern Adapter de Provider

Chaque canal de paiement a son propre adapter :
- Séparation des préoccupations
- Facile d'ajouter de nouveaux providers
- Testable en isolation
- Simulation réaliste avec délais

## Améliorations futures

Fonctionnalités additionnelles qui pourraient être ajoutées :

### Sécurité avancée
- Chiffrement/signature des requêtes (HMAC)
- Mécanisme de rotation automatique des clés API
- Contrôle d'accès basé sur les rôles (RBAC)
- Audit trail avec durée de rétention configurable

### Fonctionnalités métier
- Support de webhooks pour notifications en temps réel
- Traitement par lots de transferts
- Transferts récurrents/paiements planifiés
- Support multi-devises avec taux de change en temps réel
- Fonctionnalité de remboursement de transfert
- Support de méta-données enrichies (factures, documents)

### Infrastructure & Performance
- Cache Redis pour optimisation des requêtes fréquentes
- File de messages (RabbitMQ/SQS) pour traitement asynchrone
- Monitoring avancé (Prometheus, Grafana)
- Traçage distribué (OpenTelemetry)
- CDN pour assets statiques

### Tests avancés
- Tests de charge (k6, Artillery)
- Tests de contrat (Pact) pour intégrations
- Tests de mutation avec Stryker
- Tests de sécurité automatisés (OWASP ZAP)
- Tests de chaos engineering

### Base de données & Scalabilité
- Réplicas en lecture pour distribution de charge
- Pool de connexions optimisé
- Suppressions logiques (soft deletes) avec archivage
- Partitionnement de tables pour historique
- Stratégie de backup et disaster recovery

### Expérience développeur
- Génération automatique de SDK clients (TypeScript, Python, etc.)
- Alternative API GraphQL
- Tableau de bord d'administration (React/Vue)
- CLI pour opérations courantes
- Environnement de sandbox pour développeurs tiers

## Licence

MIT

## Support

Pour les problèmes et questions, veuillez ouvrir une issue sur GitHub.
