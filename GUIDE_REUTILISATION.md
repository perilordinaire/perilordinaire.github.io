# 🔧 Guide de réutilisation du TAV

**Vous souhaitez utiliser cet outil pour votre propre recherche ?** Excellente nouvelle : le code est ouvert et adaptable ! Suivez ce guide étape par étape pour créer votre propre Test d'Associations Verbales.

---

## 📋 Avant de commencer

**Vous aurez besoin de :**
- Un compte GitHub (gratuit)
- Un compte Google (pour le Google Sheet qui collectera vos données)
- 30 minutes de votre temps
- Vos propres termes inducteurs

**Aucune compétence en programmation n'est requise !**

---

## ⚙️ Étape 1 : Récupérer le code source

1. Allez sur la page : [https://perilordinaire.github.io/tav-raccrochage.html](https://perilordinaire.github.io/tav-raccrochage.html)
2. Faites un **clic droit** sur la page → **Afficher le code source** (ou `Ctrl+U` / `Cmd+U`)
3. **Sélectionnez tout** le code (`Ctrl+A` / `Cmd+A`)
4. **Copiez** le code (`Ctrl+C` / `Cmd+C`)

💡 **Astuce :** Tout le code est dans un seul fichier HTML — c'est voulu pour faciliter la réutilisation !

---

## 📁 Étape 2 : Créer votre dépôt GitHub

1. Connectez-vous à [GitHub](https://github.com)
2. Cliquez sur le **+** en haut à droite → **New repository**
3. Nommez votre dépôt (ex: `mon-tav-recherche`)
4. Cochez **Public**
5. Cochez **Add a README file**
6. Cliquez sur **Create repository**

---

## 📝 Étape 3 : Créer votre fichier HTML

1. Dans votre nouveau dépôt, cliquez sur **Add file** → **Create new file**
2. Nommez le fichier : `index.html`
3. **Collez** le code que vous avez copié à l'Étape 1
4. Cliquez sur **Commit changes** en bas de la page

---

## 🎯 Étape 4 : Personnaliser vos termes inducteurs

1. Dans votre fichier `index.html`, cherchez cette section (vers la ligne 690) :

```javascript
const inducteurs = [
    "Décrochage scolaire",
    "Élève de lycée professionnel",
    "Raccrochage scolaire",
    "Compétences hors-école",
    "Parcours scolaire réussi"
];
```

2. Cliquez sur l'icône **✏️ (Edit)** en haut à droite du fichier
3. **Remplacez** les termes par les vôtres, par exemple :

```javascript
const inducteurs = [
    "Motivation scolaire",
    "Apprentissage collaboratif",
    "Évaluation formative"
];
```

4. **Sauvegardez** en cliquant sur **Commit changes**

💡 **Important :** Vous pouvez mettre entre 3 et 8 termes. Gardez la même structure avec les guillemets et les virgules !

---

## 📊 Étape 5 : Configurer votre Google Sheet

### 5.1 Créer la feuille de calcul

1. Allez sur [Google Sheets](https://sheets.google.com)
2. Créez une **nouvelle feuille**
3. Nommez-la (ex: "TAV - Données Recherche")
4. Dans la **première ligne**, copiez exactement ces en-têtes :

```
Date/Heure | Sexe | Âge | Fonction | Discipline | Type Structure | 
Ancienneté Structure | Ancienneté Éducation | Diplôme | Support | 
Environnement | Isolement | Inducteur | Mot | Rang
```

### 5.2 Créer le script Google Apps

1. Dans votre Google Sheet : **Extensions** → **Apps Script**
2. Supprimez le code par défaut
3. Copiez-collez ce code :

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    data.data.forEach(row => {
      sheet.appendRow(row);
    });
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'message': 'Données enregistrées'
    }))
    .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. **Enregistrez** (icône 💾)
5. Cliquez sur **Déployer** → **Nouveau déploiement**
6. Sélectionnez **Application Web**
7. Configurez :
   - **Exécuter en tant que** : Moi
   - **Qui a accès** : Tout le monde
8. Cliquez sur **Déployer**
9. **Autorisez** l'application (suivez les étapes Google)
10. **COPIEZ l'URL** fournie (elle ressemble à `https://script.google.com/macros/s/AKfycby.../exec`)

### 5.3 Intégrer l'URL dans votre code

1. Retournez dans votre `index.html` sur GitHub
2. Cherchez cette ligne (vers la ligne 870) :

```javascript
const SCRIPT_URL = 'VOTRE_URL_GOOGLE_APPS_SCRIPT_ICI';
```

3. **Remplacez** `'VOTRE_URL_GOOGLE_APPS_SCRIPT_ICI'` par votre URL entre guillemets
4. **Sauvegardez**

---

## 🌐 Étape 6 : Activer GitHub Pages

1. Dans votre dépôt GitHub, allez dans **Settings** (en haut)
2. Dans le menu de gauche, cliquez sur **Pages**
3. Sous **Source**, sélectionnez **main** (branche)
4. Cliquez sur **Save**
5. Attendez 2-3 minutes ⏱️
6. **Votre TAV est en ligne !** L'URL sera : `https://votre-username.github.io/nom-du-depot/`

---

## ✅ Étape 7 : Tester votre TAV

1. Ouvrez l'URL de votre TAV
2. Faites un test complet du début à la fin
3. Vérifiez que les données arrivent bien dans votre Google Sheet
4. Si tout fonctionne : **bravo, c'est prêt !** 🎉

**Si ça ne marche pas :**
- Vérifiez que vous avez bien autorisé le script Google Apps
- Vérifiez que l'URL du script est correcte dans le code
- Vérifiez que les en-têtes du Google Sheet correspondent exactement

---

## 🎨 Étape 8 (optionnelle) : Personnaliser l'apparence

Vous pouvez modifier :

**Les couleurs** (cherchez `:root` vers la ligne 15) :
```css
:root {
    --primary: #1a4d2e;      /* Couleur principale */
    --accent: #e8ab5e;       /* Couleur d'accentuation */
}
```

**Le titre** (cherchez `<h1>` vers la ligne 580) :
```html
<h1>Test d'Associations Verbales</h1>
```

**Le texte d'introduction** (vers la ligne 625) : personnalisez selon votre recherche !

---

## 📖 Étape 9 : Respecter les propriétés intellectuelles

**Important :** Si vous utilisez cet outil, veuillez conserver les références méthodologiques dans le pied de page (ligne ~905) :

```html
<footer>
    <p>Test d'Associations Verbales (TAV) — Méthodologie inspirée d'Abric (2003) et Vergès (1992)</p>
</footer>
```

**Et dans vos publications, citez :**

```
Lamolet, F. (2025). Outil de Test d'Associations Verbales en ligne. 
https://perilordinaire.github.io/tav-raccrochage.html

Abric, J.-C. (2003). Les représentations sociales. PUF.

Vergès, P. (1992). L'évocation de l'argent : Une méthode pour la définition 
du noyau central d'une représentation. Bulletin de psychologie, 45(405), 203-209.
```

---

## 💡 Conseils pour votre recherche

**Taille de l'échantillon :** 
- Minimum recommandé (Abric, 2003) : **N = 80** participants
- Pour des analyses comparatives robustes : **N = 100-150**

**Nombre de termes inducteurs :**
- **3-5 termes** : test court (~5-6 min), bon taux de complétion
- **6-8 termes** : test plus long (~8-10 min), risque d'abandon

**Analyse des données :**
- Exportez votre Google Sheet en **CSV**
- Utilisez **jamovi**, **SPSS** ou **R** pour l'analyse prototypique
- Calculez : fréquence d'évocation + rang moyen pour identifier le noyau central

---

## 🤝 Besoin d'aide ?

Si vous rencontrez un problème :
1. Vérifiez que vous avez suivi **toutes les étapes** dans l'ordre
2. Consultez la section "Si ça ne marche pas" de l'Étape 7
3. Contactez-moi : **ferdinand.lamolet@univ-amu.fr**

**Bon courage avec votre recherche !** 🎓

---

*Ce guide est mis à disposition sous licence Creative Commons BY-SA 4.0. Vous êtes libre de le partager et l'adapter en citant la source.*
