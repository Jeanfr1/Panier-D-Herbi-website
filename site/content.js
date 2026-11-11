/* Panier d’Herbi — business facts (single source for the page scripts). Everything here comes from the
   kit's business-sources.json and the supplied screenshots; nothing is estimated. */
window.PANIER = {
  name: 'Panier d’Herbi',
  phone: '+33666533792', phoneDisplay: '06 66 53 37 92',
  email: 'lepanierdeherbi@gmail.com',
  address: '13 place du Général d’Argence, 44410 Herbignac',
  instagram: 'https://www.instagram.com/panier_dherbi/',
  tiktok: 'https://www.tiktok.com/@panierdherbi',
  facebook: 'https://www.facebook.com/search/top?q=Panier%20D%27Herbi%20Herbignac',
  maps: 'https://www.google.com/maps/search/?api=1&query=Panier%20d%27Herbi%2013%20place%20du%20G%C3%A9n%C3%A9ral%20d%27Argence%2044410%20Herbignac',
  mapEmbed: 'https://maps.google.com/maps?q=13+place+du+G%C3%A9n%C3%A9ral+d%27Argence%2C+44410+Herbignac&z=17&output=embed',
  reviews: 'https://www.google.com/search?q=Panier+d%27Herbi+Herbignac+avis',
  hours: [ ['Lundi','17h30 – 23h30'], ['Mardi','17h30 – 23h30'], ['Mercredi','Fermé'], ['Jeudi','17h30 – 23h30'], ['Vendredi','18h – 2h'], ['Samedi','18h – 2h'], ['Dimanche','13h – 23h'] ],
  rayons: {
    epicerie: { title: 'Épicerie', image: 'images/epicerie.webp', width: 1000, height: 750, caption: 'Les essentiels du placard, à retrouver en magasin.', description: 'Pâtes, riz, conserves : de quoi remplir le placard un soir de semaine ou dépanner à la dernière minute.', alt: 'Pâtes, riz et conserves aux couleurs Panier d’Herbi.' },
    boissons: { title: 'Boissons', image: 'images/boissons.webp', width: 900, height: 720, caption: 'Une pause, une soirée, un passage au magasin.', description: 'Eau, jus et boissons fraîches pour accompagner la journée comme la soirée.', alt: 'Bouteilles d’eau et de jus aux couleurs Panier d’Herbi.' },
    snacks:   { title: 'Snacks',   image: 'images/snacks.webp',   width: 1000, height: 750, caption: 'Les petites envies ont aussi leur rayon.', description: 'Biscuits, chips et douceurs à partager ou à garder pour soi.', alt: 'Biscuits et chips aux couleurs Panier d’Herbi.' }
  }
};
