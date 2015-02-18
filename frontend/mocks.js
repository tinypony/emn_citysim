define(['moment'], function(moment){
  return {
    getEndStopData: function(){
      var moment = moment('0000', 'HHmm');
      
      retval = [];
      
      for(var i=0; i<24; i++){
        retval.push({
          time: moment.format('HHmm'),
          power: Math.random() * 500
        });
        moment.add(i, 'hours');
      }
      
      return retval;
    },
    
    routes: [ {
      name : '701',
      length : 6461,
      departures : 20,
      stops : [ {
        'id' : '2200760',
        'order' : 1,
        'time' : '0624',
        'name' : 'Dikemark',
        'posX' : '10.3724143',
        'posY' : '59.8056475'
      }, {
        'id' : '2200755',
        'order' : 2,
        'time' : '0625',
        'name' : 'Grobråtenveien syd',
        'posX' : '10.365437',
        'posY' : '59.8107044'
      }, {
        'id' : '2200750',
        'order' : 3,
        'time' : '0626',
        'name' : 'Ingolfs vei',
        'posX' : '10.3653556',
        'posY' : '59.8174319'
      }, {
        'id' : '2200695',
        'order' : 4,
        'time' : '0627',
        'name' : 'Engelsrud',
        'posX' : '10.3657215',
        'posY' : '59.8198349'
      }, {
        'id' : '2200690',
        'order' : 5,
        'time' : '0627',
        'name' : 'Svinesjøen',
        'posX' : '10.372413',
        'posY' : '59.8212292'
      }, {
        'id' : '2200685',
        'order' : 6,
        'time' : '0629',
        'name' : 'Sportstuen',
        'posX' : '10.381429',
        'posY' : '59.8201649'
      }, {
        'id' : '2200680',
        'order' : 7,
        'time' : '0629',
        'name' : 'Trollstua',
        'posX' : '10.3893664',
        'posY' : '59.8223356'
      }, {
        'id' : '2200675',
        'order' : 8,
        'time' : '0630',
        'name' : 'Måsan',
        'posX' : '10.3944574',
        'posY' : '59.8242305'
      }, {
        'id' : '2200671',
        'order' : 9,
        'time' : '0631',
        'name' : 'Måsankroken',
        'posX' : '10.4012262',
        'posY' : '59.8269876'
      }, {
        'id' : '2200670',
        'order' : 10,
        'time' : '0632',
        'name' : 'Drengsrud skole',
        'posX' : '10.4080397',
        'posY' : '59.8286662'
      }, {
        'id' : '2200665',
        'order' : 11,
        'time' : '0633',
        'name' : 'Drengsrudveien',
        'posX' : '10.414673',
        'posY' : '59.8298613'
      }, {
        'id' : '2200664',
        'order' : 12,
        'time' : '0634',
        'name' : 'Oreholtet',
        'posX' : '10.4185526',
        'posY' : '59.8313194'
      }, {
        'id' : '2200525',
        'order' : 13,
        'time' : '0635',
        'name' : 'Hagaløkka',
        'posX' : '10.4234535',
        'posY' : '59.8332872'
      }, {
        'id' : '2200501',
        'order' : 14,
        'time' : '0638',
        'name' : 'Asker stasjon',
        'posX' : '10.4340141',
        'posY' : '59.8332534'
      } ]
    }, {
      name : '34',
      length : 10717,
      departures : 21,
      stops : [ {
        'id' : '3012231',
        'order' : 1,
        'time' : '2048',
        'name' : 'Tåsen senter',
        'posX' : '10.7510828',
        'posY' : '59.9524094'
      }, {
        'id' : '3012224',
        'order' : 2,
        'time' : '2048',
        'name' : 'Christophers vei',
        'posX' : '10.7504596',
        'posY' : '59.9497592'
      }, {
        'id' : '3012225',
        'order' : 3,
        'time' : '2049',
        'name' : 'Østhellinga',
        'posX' : '10.7492243',
        'posY' : '59.9467039'
      }, {
        'id' : '3012226',
        'order' : 4,
        'time' : '2050',
        'name' : 'Tåsen alle',
        'posX' : '10.7483381',
        'posY' : '59.9441559'
      }, {
        'id' : '3010415',
        'order' : 5,
        'time' : '2051',
        'name' : 'Voldsløkka',
        'posX' : '10.750153',
        'posY' : '59.9405483'
      }, {
        'id' : '3010412',
        'order' : 6,
        'time' : '2052',
        'name' : 'Sagene',
        'posX' : '10.7499829',
        'posY' : '59.9379998'
      }, {
        'id' : '3010405',
        'order' : 7,
        'time' : '2054',
        'name' : 'Arkitekt Rivertz plass',
        'posX' : '10.7496469',
        'posY' : '59.9343398'
      }, {
        'id' : '3010333',
        'order' : 8,
        'time' : '2055',
        'name' : 'Evald Ryghs gate',
        'posX' : '10.7489194',
        'posY' : '59.930721'
      }, {
        'id' : '3010330',
        'order' : 9,
        'time' : '2056',
        'name' : 'Alexander Kiellands plass',
        'posX' : '10.7493306',
        'posY' : '59.9283355'
      }, {
        'id' : '3010331',
        'order' : 10,
        'time' : '2058',
        'name' : 'Telthusbakken',
        'posX' : '10.7505592',
        'posY' : '59.9244841'
      }, {
        'id' : '3010516',
        'order' : 11,
        'time' : '2059',
        'name' : 'Møllerveien',
        'posX' : '10.7514097',
        'posY' : '59.9205928'
      }, {
        'id' : '3010514',
        'order' : 12,
        'time' : '2101',
        'name' : 'Calmeyers gate',
        'posX' : '10.7557415',
        'posY' : '59.9169156'
      }, {
        'id' : '3010065',
        'order' : 13,
        'time' : '2103',
        'name' : 'Brugata',
        'posX' : '10.7531812',
        'posY' : '59.9144978'
      }, {
        'id' : '3010012',
        'order' : 14,
        'time' : '2104',
        'name' : 'Jernbanetorget',
        'posX' : '10.7506854',
        'posY' : '59.9122766'
      }, {
        'id' : '3010617',
        'order' : 15,
        'time' : '2105',
        'name' : 'Bussterminalen Grønland',
        'posX' : '10.7592463',
        'posY' : '59.9111477'
      }, {
        'id' : '3010625',
        'order' : 16,
        'time' : '2106',
        'name' : 'Munkegata',
        'posX' : '10.7679304',
        'posY' : '59.9083101'
      }, {
        'id' : '3010620',
        'order' : 17,
        'time' : '2107',
        'name' : 'St. Halvards plass',
        'posX' : '10.7678492',
        'posY' : '59.9061107'
      }, {
        'id' : '3010622',
        'order' : 18,
        'time' : '2108',
        'name' : 'Dyvekes bro',
        'posX' : '10.7689753',
        'posY' : '59.905431'
      }, {
        'id' : '3010652',
        'order' : 19,
        'time' : '2109',
        'name' : 'Lodalen',
        'posX' : '10.7779137',
        'posY' : '59.9033797'
      }, {
        'id' : '3010650',
        'order' : 20,
        'time' : '2110',
        'name' : 'Kværner',
        'posX' : '10.7888888',
        'posY' : '59.9019828'
      }, {
        'id' : '3010727',
        'order' : 21,
        'time' : '2111',
        'name' : 'Ryenbergveien',
        'posX' : '10.7863136',
        'posY' : '59.9009758'
      }, {
        'id' : '3010726',
        'order' : 22,
        'time' : '2112',
        'name' : 'Simensbrekka',
        'posX' : '10.7821986',
        'posY' : '59.9009238'
      }, {
        'id' : '3010725',
        'order' : 23,
        'time' : '2112',
        'name' : 'Utsikten',
        'posX' : '10.7794532',
        'posY' : '59.900404'
      }, {
        'id' : '3010724',
        'order' : 24,
        'time' : '2113',
        'name' : 'Brannfjellveien',
        'posX' : '10.773585',
        'posY' : '59.9003304'
      }, {
        'id' : '3010723',
        'order' : 25,
        'time' : '2115',
        'name' : 'Ekeberg Camping',
        'posX' : '10.7759196',
        'posY' : '59.897847'
      }, {
        'id' : '3010766',
        'order' : 26,
        'time' : '2116',
        'name' : 'Ekeberg hageby',
        'posX' : '10.7813853',
        'posY' : '59.897423'
      }, {
        'id' : '3010760',
        'order' : 27,
        'time' : '2119',
        'name' : 'Simensbråten',
        'posX' : '10.7869982',
        'posY' : '59.8954159'
      } ]
    }, {
      name : '731',
      length : 8582,
      departures : 19,
      stops : [ {
        'id' : '2190401',
        'order' : 1,
        'time' : '1224',
        'name' : 'Sandvika terminal',
        'posX' : '10.5239065',
        'posY' : '59.8927305'
      }, {
        'id' : '2190308',
        'order' : 2,
        'time' : '1226',
        'name' : 'Evje',
        'posX' : '10.5212929',
        'posY' : '59.897332'
      }, {
        'id' : '2190430',
        'order' : 3,
        'time' : '1227',
        'name' : 'Valler skole',
        'posX' : '10.5272844',
        'posY' : '59.9005138'
      }, {
        'id' : '2190312',
        'order' : 4,
        'time' : '1228',
        'name' : 'Lindelia',
        'posX' : '10.5295562',
        'posY' : '59.9032626'
      }, {
        'id' : '2190355',
        'order' : 5,
        'time' : '1229',
        'name' : 'Gjettum skole',
        'posX' : '10.5334331',
        'posY' : '59.9074656'
      }, {
        'id' : '2190321',
        'order' : 6,
        'time' : '1230',
        'name' : 'Valler',
        'posX' : '10.5363024',
        'posY' : '59.9099648'
      }, {
        'id' : '2190332',
        'order' : 7,
        'time' : '1230',
        'name' : 'Christian Skredsvigs vei',
        'posX' : '10.541016',
        'posY' : '59.9117329'
      }, {
        'id' : '2190284',
        'order' : 8,
        'time' : '1231',
        'name' : 'Kitty Kiellands vei',
        'posX' : '10.5454624',
        'posY' : '59.913513'
      }, {
        'id' : '2190281',
        'order' : 9,
        'time' : '1232',
        'name' : 'Avløs',
        'posX' : '10.5523042',
        'posY' : '59.9148696'
      }, {
        'id' : '2190218',
        'order' : 10,
        'time' : '1234',
        'name' : 'Haslum postkontor',
        'posX' : '10.5601146',
        'posY' : '59.9174178'
      }, {
        'id' : '2190217',
        'order' : 11,
        'time' : '1235',
        'name' : 'Haslum terrasse',
        'posX' : '10.5607818',
        'posY' : '59.9205802'
      }, {
        'id' : '2190222',
        'order' : 12,
        'time' : '1236',
        'name' : 'Haslum kirke',
        'posX' : '10.5647823',
        'posY' : '59.9234786'
      }, {
        'id' : '2190815',
        'order' : 13,
        'time' : '1237',
        'name' : 'Haslum skole',
        'posX' : '10.5706131',
        'posY' : '59.924963'
      }, {
        'id' : '2190810',
        'order' : 14,
        'time' : '1238',
        'name' : 'Øygardveien',
        'posX' : '10.5762448',
        'posY' : '59.9211058'
      }, {
        'id' : '2190808',
        'order' : 15,
        'time' : '1239',
        'name' : 'Nadderud stadion',
        'posX' : '10.5800592',
        'posY' : '59.9193088'
      }, {
        'id' : '2190149',
        'order' : 16,
        'time' : '1242',
        'name' : 'Bekkestua',
        'posX' : '10.5888578',
        'posY' : '59.9173889'
      } ]

    }, {
      name : '37',
      length : 14100,
      departures : 18,
      stops : [ {
        'id' : '3011441',
        'order' : 1,
        'time' : '0030',
        'name' : 'Helsfyr T',
        'posX' : '10.8011835',
        'posY' : '59.9127549'
      }, {
        'id' : '3010643',
        'order' : 2,
        'time' : '0032',
        'name' : 'Etterstadgata',
        'posX' : '10.7910173',
        'posY' : '59.9099654'
      }, {
        'id' : '3010642',
        'order' : 3,
        'time' : '0033',
        'name' : 'Vålerenga',
        'posX' : '10.7871654',
        'posY' : '59.9088411'
      }, {
        'id' : '3010641',
        'order' : 4,
        'time' : '0034',
        'name' : 'Galgeberg',
        'posX' : '10.7820334',
        'posY' : '59.9078508'
      }, {
        'id' : '3010627',
        'order' : 5,
        'time' : '0035',
        'name' : 'Harald Hårdrådes plass',
        'posX' : '10.7726644',
        'posY' : '59.907546'
      }, {
        'id' : '3010624',
        'order' : 6,
        'time' : '0036',
        'name' : 'Oslo gate',
        'posX' : '10.7693812',
        'posY' : '59.9083535'
      }, {
        'id' : '3010626',
        'order' : 7,
        'time' : '0037',
        'name' : 'Politihuset',
        'posX' : '10.7678002',
        'posY' : '59.9102339'
      }, {
        'id' : '3010613',
        'order' : 8,
        'time' : '0038',
        'name' : 'Tøyengata',
        'posX' : '10.7644982',
        'posY' : '59.9123798'
      }, {
        'id' : '3010617',
        'order' : 9,
        'time' : '0039',
        'name' : 'Bussterminalen Grønland',
        'posX' : '10.7592463',
        'posY' : '59.9111477'
      }, {
        'id' : '3010012',
        'order' : 10,
        'time' : '0042',
        'name' : 'Jernbanetorget',
        'posX' : '10.7506854',
        'posY' : '59.9122766'
      }, {
        'id' : '3010082',
        'order' : 11,
        'time' : '0048',
        'name' : 'Arne Garborgs pl',
        'posX' : '10.7449345',
        'posY' : '59.9165202'
      }, {
        'id' : '3010324',
        'order' : 12,
        'time' : '0050',
        'name' : 'Nordahl Bruns gate',
        'posX' : '10.7436443',
        'posY' : '59.9192048'
      }, {
        'id' : '3010323',
        'order' : 13,
        'time' : '0051',
        'name' : 'Stensberggata',
        'posX' : '10.7412676',
        'posY' : '59.9223258'
      }, {
        'id' : '3010320',
        'order' : 14,
        'time' : '0052',
        'name' : 'St. Hanshaugen',
        'posX' : '10.7397079',
        'posY' : '59.923972'
      }, {
        'id' : '3010326',
        'order' : 15,
        'time' : '0053',
        'name' : 'Colletts gate',
        'posX' : '10.7387558',
        'posY' : '59.9269754'
      }, {
        'id' : '3010335',
        'order' : 16,
        'time' : '0054',
        'name' : 'Lovisenberg',
        'posX' : '10.7427315',
        'posY' : '59.9307939'
      }, {
        'id' : '3010336',
        'order' : 17,
        'time' : '0054',
        'name' : 'Tannlegehøyskolen',
        'posX' : '10.7421428',
        'posY' : '59.9328764'
      }, {
        'id' : '3010345',
        'order' : 18,
        'time' : '0055',
        'name' : 'Lindern',
        'posX' : '10.7436795',
        'posY' : '59.9345356'
      }, {
        'id' : '3010410',
        'order' : 19,
        'time' : '0056',
        'name' : 'Sagene',
        'posX' : '10.7511252',
        'posY' : '59.9375984'
      }, {
        'id' : '3010425',
        'order' : 20,
        'time' : '0057',
        'name' : 'Arendalsgata',
        'posX' : '10.7585093',
        'posY' : '59.9374463'
      }, {
        'id' : '3010423',
        'order' : 21,
        'time' : '0058',
        'name' : 'Advokat Dehlis plass',
        'posX' : '10.7592247',
        'posY' : '59.9391253'
      }, {
        'id' : '3010420',
        'order' : 22,
        'time' : '0059',
        'name' : 'Bjølsen',
        'posX' : '10.759638',
        'posY' : '59.9425327'
      }, {
        'id' : '3010427',
        'order' : 23,
        'time' : '0100',
        'name' : 'Badebakken',
        'posX' : '10.7602023',
        'posY' : '59.9457495'
      }, {
        'id' : '3012238',
        'order' : 24,
        'time' : '0101',
        'name' : 'Nydalsveien',
        'posX' : '10.7639266',
        'posY' : '59.9474422'
      }, {
        'id' : '3012131',
        'order' : 25,
        'time' : '0102',
        'name' : 'Nydalen T',
        'posX' : '10.7674066',
        'posY' : '59.9492458'
      } ]
    }, {
      name : '77',
      length : 8189,
      departures : 23,
      stops: [   {
        'id' : '3010975',
        'order' : 1,
        'time' : '1916',
        'name' : 'Bjørndal',
        'posX' : '10.8396783',
        'posY' : '59.821337'
      },
      {
        'id' : '3010974',
        'order' : 2,
        'time' : '1917',
        'name' : 'Meklenborg',
        'posX' : '10.8356138',
        'posY' : '59.8239716'
      },
      {
        'id' : '3010973',
        'order' : 3,
        'time' : '1917',
        'name' : 'Bjørndal senter',
        'posX' : '10.8355645',
        'posY' : '59.8259932'
      },
      {
        'id' : '3010972',
        'order' : 4,
        'time' : '1919',
        'name' : 'Nyjordet',
        'posX' : '10.8372619',
        'posY' : '59.8305771'
      },
      {
        'id' : '3010977',
        'order' : 5,
        'time' : '1919',
        'name' : 'Bjørnholt skole',
        'posX' : '10.8379555',
        'posY' : '59.8344206'
      },
      {
        'id' : '3010969',
        'order' : 6,
        'time' : '1920',
        'name' : 'Bjørnholt nedre',
        'posX' : '10.8351544',
        'posY' : '59.8363728'
      },
      {
        'id' : '3010956',
        'order' : 7,
        'time' : '1921',
        'name' : 'Oredalen',
        'posX' : '10.8287378',
        'posY' : '59.8400908'
      },
      {
        'id' : '3010916',
        'order' : 8,
        'time' : '1924',
        'name' : 'Nebbejordet',
        'posX' : '10.8130849',
        'posY' : '59.8430198'
      },
      {
        'id' : '3010957',
        'order' : 9,
        'time' : '1925',
        'name' : 'Bjørnerud',
        'posX' : '10.8191154',
        'posY' : '59.8439605'
      },
      {
        'id' : '3010911',
        'order' : 10,
        'time' : '1928',
        'name' : 'Hauketo stasjon',
        'posX' : '10.8033135',
        'posY' : '59.8461629'
      },
      {
        'id' : '3010912',
        'order' : 11,
        'time' : '1928',
        'name' : 'Asperudveien',
        'posX' : '10.8024378',
        'posY' : '59.844163'
      },
      {
        'id' : '3010922',
        'order' : 12,
        'time' : '1931',
        'name' : 'Skovbakken syd',
        'posX' : '10.7945112',
        'posY' : '59.8374991'
      },
      {
        'id' : '3010923',
        'order' : 13,
        'time' : '1932',
        'name' : 'Ravnkroken',
        'posX' : '10.7899196',
        'posY' : '59.8370676'
      },
      {
        'id' : '3010924',
        'order' : 14,
        'time' : '1932',
        'name' : 'Ravnåsen',
        'posX' : '10.7870076',
        'posY' : '59.8380053'
      },
      {
        'id' : '3010923',
        'order' : 15,
        'time' : '1933',
        'name' : 'Ravnkroken',
        'posX' : '10.7899196',
        'posY' : '59.8370676'
      },
      {
        'id' : '3010921',
        'order' : 16,
        'time' : '1935',
        'name' : 'Holmlia stasjon',
        'posX' : '10.7968182',
        'posY' : '59.8349438'
      }]
    } ]
  }
});