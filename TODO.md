# Site fractalogie.ai — à compléter / capitaliser

## ✅ En ligne maintenant (gratuit, GitHub Pages)
- URL actuelle : **https://pierro0t.github.io/FractalogieAI-website/**
- 4 langues : EN (racine) · `/fr/` · `/es/` · `/de/`
- Pages par langue : accueil · `privacy.html` · `terms.html` · `support.html`
- Les liens Terms/Privacy de l'app pointent déjà sur ces URLs.

## 🔜 À faire plus tard (par ordre d'importance)

1. **Domaine fractalogie.ai** (quand tu l'as)
   - Pointer le domaine sur GitHub Pages : ajouter un fichier `CNAME` (contenu = `fractalogie.ai`) + régler le DNS chez le registrar.
   - Remettre les liens légaux de l'app sur le joli domaine : dans `mobile/src/lib/legal.ts`, repasser à `https://fractalogie.ai/terms` et `/privacy`.
   - (option) réactiver les "clean URLs" (sans `.html`).

2. **Email `contact@fractalogie.ai`** — DOIT exister et recevoir les mails.
   - Il est utilisé partout : pages légales, support, bouton « Get notified », contact RGPD.
   - Mettre en place une vraie boîte ou une simple redirection vers ton email perso.

3. **Lien App Store** — une fois l'app publiée
   - Remplacer le badge « Coming soon · iOS » et le bouton « Get notified » par un vrai bouton **« Download on the App Store »**.
   - Ajouter le smart-banner : `<meta name="apple-itunes-app" content="app-id=XXXXXXXX">` dans le `<head>`.

4. **Prix réel** — le bloc Pricing affiche `—`. Mettre le vrai prix de Founding Access une fois fixé (dans les 4 langues).

5. **Image de partage (Open Graph)** — créer un vrai `og-image.png` 1200×630 px (actuellement c'est le logo). C'est l'aperçu affiché quand on partage le lien sur iMessage / réseaux.

6. **Icônes** — ajouter un `apple-touch-icon.png` (180×180) et un `favicon.ico` propres (actuellement : favicon SVG basique).

7. **(option) SEO** — une fois le domaine en place : créer la propriété Google Search Console + soumettre `sitemap.xml`. Mettre à jour les balises `canonical`/`hreflang`/`og:url` (elles pointent déjà vers fractalogie.ai).

8. **(option) Liens légaux localisés dans l'app** — ouvrir `/fr/privacy.html` pour un utilisateur FR, etc. (actuellement toujours en anglais — accepté par Apple, mais plus soigné localisé).

## ℹ️ Notes techniques
- Hébergé sur GitHub Pages depuis la branche `main` (racine). Chaque `git push` redéploie automatiquement (~1 min).
- Le site est en HTML/CSS/JS statique, sans build : pour modifier un texte, éditer directement le `.html` puis push.
