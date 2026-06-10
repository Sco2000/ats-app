// details.js
Page({

  data: {
    destination: {
      id: 1,
      title: 'Lac Rose',
      rating: 5.0,
      reviewsCount: 203,
      location: 'Lac Retba',
      duration: 'Demi-journée',
      price: '15 000',
      currency: 'FCFA',
      category: 'Dakar',
      heroImage: '/assets/images/img.jpg',
      isLiked: false,
      description: "Avec une superficie d'environ (04) quatre kilomètres, c'est un espace où vous trouverez en même temps des dunes, un lac et l'océan atlantique. Au lac rose, vous serez certainement ébloui par toute cette diversité. Au bord d'une pirogue, vous pourrez aussi faire le tour du lac, observer le paysage orné par le sel, les travailleurs... L'aventure se poursuivra ensuite autour des dunes, à dos de dromadaire.",
      gallery: [
        '/assets/images/img.jpg',
        '/assets/images/img.jpg',
        '/assets/images/img.jpg',
        '/assets/images/img.jpg',
        '/assets/images/img.jpg',
        '/assets/images/img.jpg',
      ]
    },
    galleryRows: []
  },

  /**
   * ============================================================
   * LOGIQUE GALERIE PHOTOS (Nouvelles règles)
   * ============================================================
   *  1. 1 photo : 1 grand format au début
   *  2. 2 photos : Seulement 2 petits (côte à côte), PAS de grand.
   *  3. Plus de 2 photos : 
   *      - Toujours 1 grand au début.
   *      - Si le nombre TOTAL de photos est PAIRE (4, 6, 8...) : le dernier sera un grand format.
   *      - Si le nombre TOTAL de photos est IMPAIR (3, 5, 7...) : pas de grand à la fin.
   *      - Toutes les photos intermédiaires sont regroupées par 2 (petits).
   * 
   *  Exemples:
   *    1 photo -> [grand]
   *    2 photos -> [petit, petit]
   *    3 photos -> [grand] [petit, petit]
   *    4 photos -> [grand] [petit, petit] [grand]
   *    5 photos -> [grand] [petit, petit] [petit, petit]
   *    6 photos -> [grand] [petit, petit] [petit, petit] [grand]
   * ============================================================
   */
  buildGalleryRows(gallery) {
    const rows = [];
    if (!gallery || gallery.length === 0) return rows;

    const n = gallery.length;

    // Règle: 1 photo -> 1 grand
    if (n === 1) {
      rows.push({ type: 'single', photos: [gallery[0]] });
      return rows;
    }

    // Règle: 2 photos -> 2 petits côte à côte (pas de grand)
    if (n === 2) {
      rows.push({ type: 'double', photos: [gallery[0], gallery[1]] });
      return rows;
    }

    // Règle: plus de 2 photos
    // Toujours 1 grand au début
    rows.push({ type: 'single', photos: [gallery[0]] });

    // Le grand à la fin apparaît SI ET SEULEMENT SI le nombre total est pair
    const hasLastGrand = (n % 2 === 0);

    // Le nombre de photos à traiter au milieu (en paires)
    const middleCount = hasLastGrand ? n - 2 : n - 1;

    let i = 1;
    while (i <= middleCount) {
      rows.push({ type: 'double', photos: [gallery[i], gallery[i + 1]] });
      i += 2;
    }

    // Ajouter le grand final si nécessaire
    if (hasLastGrand) {
      rows.push({ type: 'single', photos: [gallery[n - 1]] });
    }

    return rows;
  },

  handleBackTap() {
    wx.navigateBack();
  },

  handleLikeTap() {
    this.setData({ 'destination.isLiked': !this.data.destination.isLiked });
  },

  goToReservation() {
    wx.navigateTo({ url: '/pages/reservation/reservation' });
  },

  onLoad(options) {
    const galleryRows = this.buildGalleryRows(this.data.destination.gallery);
    this.setData({ galleryRows });
  },

  onReady() { },
  onShow() { },
  onHide() { },
  onUnload() { },
})
