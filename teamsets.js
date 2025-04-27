// Team Sets Management
const SAVED_SETS_KEY = 'nikkePortraitSavedSets';

// Function to find the full image path by ID
function findFullImagePathById(id) {
    // Finding image path for ID

    // First try to find the image in the gallery by data-id attribute
    const galleryPhotos = document.querySelectorAll('.gallery .photo');
    for (const photo of galleryPhotos) {
        if (photo.getAttribute('data-id') === id) {
            const imgElement = photo.querySelector('img');
            if (imgElement && imgElement.src) {
                // Found image in gallery by data-id
                return imgElement.src;
            }
        }
    }

    // If we can't find it by data-id, try to find it by looking at the first part of the filename
    const allImages = document.querySelectorAll('.gallery .photo img');
    for (const img of allImages) {
        const src = img.src;
        const filename = src.split('/').pop();
        const parts = filename.split('_');

        if (parts.length > 0 && parts[0] === id) {
            // Found image by filename first part
            return src;
        }
    }

    // If we still can't find it, try to find it in any image on the page
    const pageImages = document.querySelectorAll('img');
    for (const img of pageImages) {
        const src = img.src;
        if (src.includes('/image-id/')) {
            const filename = src.split('/').pop();
            const parts = filename.split('_');

            if (parts.length > 0 && parts[0] === id) {
                // Found image in page images
                return src;
            }
        }
    }

    // If we still can't find it, use a fallback approach
    // Look for any data-* attributes in the HTML that might contain the full filename
    const elements = document.querySelectorAll(`[data-id="${id}"]`);
    for (const el of elements) {
        if (el.dataset.filename) {
            const path = `https://raw.githubusercontent.com/sirentide/public-host/refs/heads/master/image-id/${el.dataset.filename}`;
            // Found image by data-filename
            return path;
        }
    }

    // Try to find by character name if the ID might be a name
    // This helps with older JSON files that might store character names instead of IDs
    if (isNaN(parseInt(id))) {
        // console.log(`ID "${id}" appears to be a name, trying to find by name`);

        // Check if it's a character name
        const characterName = id.toLowerCase();

        // Look for a photo with matching data-name
        for (const photo of galleryPhotos) {
            const photoName = (photo.getAttribute('data-name') || '').toLowerCase();

            // Check for partial or exact name match
            if (photoName.includes(characterName) || characterName.includes(photoName)) {
                const imgElement = photo.querySelector('img');
                if (imgElement && imgElement.src) {
                    // console.log(`Found image by character name match: ${photoName} matches ${characterName}`);
                    return imgElement.src;
                }
            }
        }

        // Look for a filename containing the character name
        for (const img of allImages) {
            const src = img.src;
            const filename = src.split('/').pop().toLowerCase();

            if (filename.includes(characterName)) {
                // console.log(`Found image by filename containing character name: ${src}`);
                return src;
            }
        }
    }

    // Try to find by data-number if the ID might be a number attribute
    // Trying to find by data-number attribute
    for (const photo of galleryPhotos) {
        if (photo.getAttribute('data-number') === id) {
            const imgElement = photo.querySelector('img');
            if (imgElement && imgElement.src) {
                // Found image by data-number
                return imgElement.src;
            }
        }
    }

    // Try to find by combined number and name
    // This handles cases where the ID might be in the format "number_name" or "name_number"
    // Trying to find by combined number and name
    if (id.includes('_')) {
        const parts = id.split('_');
        if (parts.length >= 2) {
            // Try both possibilities: number_name and name_number
            const possibleNumber1 = parts[0];
            const possibleName1 = parts[1];
            const possibleNumber2 = parts[1];
            const possibleName2 = parts[0];

            // First try number_name format
            for (const photo of galleryPhotos) {
                const photoNumber = photo.getAttribute('data-number');
                const photoName = photo.getAttribute('data-name');

                if (photoNumber === possibleNumber1 &&
                    photoName && photoName.toLowerCase().includes(possibleName1.toLowerCase())) {
                    const imgElement = photo.querySelector('img');
                    if (imgElement && imgElement.src) {
                        // Found image by number_name match
                        return imgElement.src;
                    }
                }
            }

            // Then try name_number format
            for (const photo of galleryPhotos) {
                const photoNumber = photo.getAttribute('data-number');
                const photoName = photo.getAttribute('data-name');

                if (photoNumber === possibleNumber2 &&
                    photoName && photoName.toLowerCase().includes(possibleName2.toLowerCase())) {
                    const imgElement = photo.querySelector('img');
                    if (imgElement && imgElement.src) {
                        // Found image by name_number match
                        return imgElement.src;
                    }
                }
            }
        }
    }

    // Last resort: check if we have a mapping in our code
    // Format: ID_number_faction_rarity_type_position_weapon_name.webp
    const idMapping = {
        // Core mapping for common Nikkes
        '0': '0_105_abnormal_ssr_b3_atk_ar_Asuka_Shikinami_Langley.webp',
        '100': '100_56_tetra_ssr_b1_sp_rl_yan.webp',
        '101': '101_56_tetra_ssr_b3_atk_snr_alice.webp',
        '102': '102_597_elysion_ssr_b3_atk_snr_helm.webp',
        '103': '103_630_abnormal_ssr_b3_atk_rl_emilia.webp',
        '104': '104_70_abnormal_ssr_b3_atk_ar_2b.webp',
        '105': '105_70_elysion_r_b3_sp_ar_soldereg.webp',
        '106': '106_70_elysion_sr_B3_atk_ar_rapi.webp',
        '107': '107_70_elysion_ssr_b2_atk_ar_Helm_Aquamarine.webp',
        '108': '108_70_elysion_ssr_b3_atk_ar_brid.webp',
        '109': '109_70_elysion_ssr_b3_atk_ar_guillotine_winter_slayer.webp',
        '10': '10_120_elysion_ssr_b2_def_sg_poli.webp',
        '110': '110_70_elysion_ssr_b3_atk_ar_privaty.webp',
        '111': '111_70_missilis_ssr_b1_sp_ar_tove.webp',
        '112': '112_70_missilis_ssr_b2_def_ar_sin.webp',
        '113': '113_70_missilis_ssr_B3_atk_ar_julia.webp',
        '114': '114_70_tetra_ssr_b1_def_ar_Rupee_Winter_Shopper.webp',
        '115': '115_70_tetra_ssr_b2_def_ar_blanc.webp',
        '116': '116_70_tetra_ssr_b2_def_ar_folkwang.webp',
        '117': '117_70_tetra_ssr_b2_sp_ar_Rosanna_Chic_Ocean.webp',
        '118': '118_70_tetra_ssr_b3_atk_ar_rupee.webp',
        '119': '119_72_pilgrim_ssr_B3_atk_mg_modernia.webp',
        '11': '11_120_elysion_ssr_b2_sp_sg_marciana.webp',
        '120': '120_76_pilgrim_ssr_B1_snr_sp_rapunzel_pure_grace.webp',
        '121': '121_79_elysion_sr_b2_def_sr_Delta.webp',
        '122': '122_79_missilis_ssr_b3_atk_smg_Quency_Escape_Queen.webp',
        '123': '123_79_tetra_ssr_b1_sp_snr_frima.webp',
        '124': '124_79_tetra_ssr_b1_sp_snr_Mary_Bay_Goddess.webp',
        '125': '125_80_tetra_ssr_b3_atk_ar_Sakura_Bloom_in_Summer.webp',
        '126': '126_81_missilis_ssr_b2_sp_snr_admi.webp',
        '127': '127_81_tetra_ssr_b1_sp_smg_ludmilla.webp',
        '128': '128_81_tetra_ssr_b1_sp_snr_sakura.webp',
        '129': '129_82_tetra_ssr_b3_atk_snr_yulha.webp',
        '12': '12_120_missilis_ssr_b1_sp_sg_ether.webp',
        '130': '130_84_abnormal_sr_b1_sp_snr_ram.webp',
        '131': '131_84_abnormal_ssr_b2_sp_snr_Mari_Makinami_Illustrious.webp',
        '132': '132_84_elysion_ssr_b1_sp_snr_D_Killer_Wife.webp',
        '133': '133_84_elysion_ssr_b3_atk_snr_helm.webp',
        '134': '134_84_missilis_r_b1_sp_snr_product08.webp',
        '135': '135_84_missilis_ssr_b3_atk_snr_maxwell.webp',
        '136': '136_84_missilis_ssr_b3_atk_snr_trony.webp',
        '137': '137_84_pilgrim_ssr_a_atk_snr_redhood.webp',
        '138': '138_84_pilgrim_ssr_b1_sp_ar_dorothy.webp',
        '139': '139_84_tetra_ssr_b1_atk_snr_milk.webp',
        '13': '13_120_missilis_ssr_b2_atk_sg_guilty.webp',
        '140': '140_84_tetra_ssr_b1_sp_snr_cocoa.webp',
        '141': '141_84_tetra_ssr_b1_sp_snr_exia.webp',
        '142': '142_84_tetra_ssr_b1_sp_snr_rouge.webp',
        '143': '143_84_tetra_ssr_b2_sp_snr_dolla.webp',
        '144': '144_87_abnormal_ssr_b2_sp_snr_himeno.webp',
        '145': '145_87_elysion_ssr_b2_atk_snr_eunhwa.webp',
        '146': '146_87_elysion_ssr_b3_atk_ar_phantom.webp',
        '147': '147_87_missilis_sr_b3_atk_ar_mihara.webp',
        '148': '148_87_pilgrim_ssr_B3_atk_ar_snow_white.webp',
        '149': '149_87_tetra_r_b1_def_rl_idollflower.webp',
        '14': '14_120_missilis_ssr_b2_sp_sg_naga.webp',
        '150': '150_87_tetra_r_b3_sp_ar_idollsun.webp',
        '151': '151_87_tetra_ssr_B1_def_ar_moran.webp',
        '152': '152_87_tetra_ssr_b2_sp_ar_ade.webp',
        '153': '153_90_abnormal_ssr_b3_atk_ar_rei_ayanami_tentative_name.webp',
        '15': '15_120_pilgrim_ssr_B3_sg_atk_isabel.webp',
        '16': '16_120_tetra_ssr_b1_sp_sg_mary.webp',
        '17': '17_120_tetra_ssr_b2_sp_sg_leona.webp',
        '18': '18_120_tetra_ssr_b3_sg_atk_neve.webp',
        '19': '19_126_pilgrim_ssr_b2_sp_ar_grave.webp',
        '1': '1_108_elysion_ssr_b3_atk_smg_soline.webp',
        '20': '20_128_elysion_ssr_b3_atk_sg_Privaty_Unkind_Maid.webp',
        '21': '21_130_tetra_ssr_b3_sp_sg_anis_sparkling_summer.webp',
        '22': '22_132_missilis_ssr_b3_atk_ar_mana.webp',
        '23': '23_137_pilgrim_ssr_b3_atk_rl_scarletblackshadow.webp',
        '24': '24_145_pilgrim_ssr_b3_snr_atk_harran.webp',
        '25': '25_149_missilis_ssr_b3_atk_ar_mana.webp',
        '26': '26_157_pilgrim_ssr_b3_atk_ar_scarlet.webp',
        '27': '27_168_abnormal_ssr_b3_atk_rl_power.webp',
        '28': '28_168_elysion_sr_b1_def_rl_anchor.webp',
        '29': '29_168_elysion_ssr_b2_sp_rl_Anchor_Innocent_Maid.webp',
        '2': '2_108_missilis_ssr_b1_def_smg_crow.webp',
        '30': '30_168_elysion_ssr_b3_atk_rl_vesti.webp',
        '31': '31_168_elysion_ssr_b3_sp_rl_quiry.webp',
        '32': '32_168_missilis_ssr_b1_def_rl_tia.webp',
        '33': '33_168_missilis_ssr_b2_sp_rl_Anne_Miracle_Fairy.webp',
        '34': '34_168_tetra_sr_b1_sp_rl_mica.webp',
        '35': '35_168_tetra_ssr_b1_sp_rl_noise.webp',
        '36': '36_168_tetra_ssr_b1_sp_smg_micax.webp',
        '37': '37_168_tetra_ssr_b2_def_rl_bay.webp',
        '38': '38_168_tetra_ssr_b2_sp_rl_biscuit.webp',
        '39': '39_174_pilgrim_ssr_b1_sp_rl_rapunzel.webp',
        '3': '3_108_missilis_ssr_b2_sp_smg_quency.webp',
        '40': '40_18_pilgrim_ssr_b3_atk_ar_Snow_White_Innocent_Day.webp',
        '41': '41_210_elysion_ssr_b1_sp_sg_zwei.webp',
        '42': '42_216_tetra_ssr_b1_sp_smg_micax2.webp',
        '43': '43_230_abnormal_sr_b1_sp_snr_pascal.webp',
        '44': '44_234_abnormal_ssr_b3_atk_rl_a2.webp',
        '45': '45_252_pilgrim_ssr_b2_snr_atk_nihilister.webp',
        '46': '46_261_missilis_ssr_b3_atk_rl_laplace.webp',
        '47': '47_270_elysion_sr_b1_sp_sg_neon.webp',
        '48': '48_270_elysion_ssr_b3_atk_sg_maiden.webp',
        '49': '49_270_missilis_r_b2_sp_sg_product23.webp',
        '4': '4_112_missilis_ssr_b1_sp_rl_n102.webp',
        '50': '50_270_missilis_ssr_b1_sp_sg_pepper.webp',
        '51': '51_270_missilis_ssr_b3_atk_sg_drake.webp',
        '52': '52_270_tetra_ssr_b2_atk_sg_viper.webp',
        '53': '53_270_tetra_ssr_b3_atk_sg_noir.webp',
        '54': '54_270_tetra_ssr_b3_atk_sg_Soda_Twinkling_Bunny.webp',
        '55': '55_270_tetra_ssr_b3_atk_sg_sugar.webp',
        '56': '56_273_elysion_ssr_b3_def_rl_maiden_ice_rose.webp',
        '57': '57_360_pilgrim_ssr_b2_def_rl_noah.webp',
        '58': '58_36_abnormal_ssr_b2_sp_mg_rem.webp',
        '59': '59_36_abnormal_ssr_b3_atk_ar_asuka_wille.webp',
        '5': '5_112_missilis_ssr_b2_def_rl_yuni.webp',
        '60': '60_36_abnormal_ssr_b3_atk_mg_rei_ayanami.webp',
        '61': '61_36_elysion_ssr_b1_sp_mg_emma.webp',
        '62': '62_36_elysion_ssr_b2_def_mg_diesel.webp',
        '63': '63_36_elysion_ssr_b2_sp_mg_Mast_Romantic_Maid.webp',
        '64': '64_36_elysion_ssr_b3_atk_mg_guillotine.webp',
        '65': '65_36_elysion_ssr_b3_atk_mg_Neon_Blue_Ocean.webp',
        '66': '66_36_elysion_ssr_b3_atk_mg_red_rapi_rrh.webp',
        '67': '67_36_missilis_r_b3_atk_mg_product12.webp',
        '68': '68_36_missilis_ssr_b2_sp_mg_eleg.webp',
        '69': '69_36_missilis_ssr_b3_def_mg_kilo.webp',
        '6': '6_112_missilis_ssr_b3_atk_snr_ein.webp',
        '70': '70_36_pilgrim_ssr_b2_def_mg_crown.webp',
        '71': '71_36_pilgrim_ssr_B3_def_rl_cinderella.webp',
        '72': '72_36_tetra_ssr_b1_atk_mg_rosanna.webp',
        '73': '73_36_tetra_ssr_b1_sp_mg_soda.webp',
        '74': '74_36_tetra_ssr_b2_atk_mg_aria.webp',
        '75': '75_36_tetra_ssr_b3_atk_mg_Ludmilla_Winter_Owner.webp',
        '76': '76_378_abnormal_ssr_b3_atk_rl_emilia.webp',
        '77': '77_390_tetra_ssr_b1_def_rl_rumani.webp',
        '78': '78_396_elysion_ssr_b3_atk_snr_helm.webp',
        '79': '79_414_missilis_ssr_b2_def_rl_centi.webp',
        '7': '7_112_tetra_sr_b2_atk_rl_belorta.webp',
        '80': '80_426_missilis_ssr_b1_def_rl_jackal.webp',
        '81': '81_426_tetra_sr_b2_def_rl_anis.webp',
        '82': '82_432_missilis_ssr_b2_sp_rl_trina.webp',
        '83': '83_504_abnormal_ssr_b3_atk_rl_emilia.webp',
        '84': '84_54_abnormal_sr_b1_sp_smg_Misato_Katsuragi.webp',
        '85': '85_54_abnormal_ssr_b2_def_smg_makima.webp',
        '86': '86_54_elysion_r_b1_sp_smg_solderow.webp',
        '87': '87_54_elysion_ssr_b1_sp_smg_miranda.webp',
        '88': '88_54_elysion_ssr_b2_atk_smg_signal.webp',
        '89': '89_54_elysion_ssr_b2_sp_smg_mast.webp',
        '8': '8_116_missilis_ssr_b3_atk_rl_laplace.webp',
        '90': '90_54_elysion_ssr_b3_atk_smg_d.webp',
        '91': '91_54_missilis_ssr_b1_sp_smg_liter.webp',
        '92': '92_54_missilis_ssr_B3_atk_smg_epinel.webp',
        '93': '93_54_tetra_r_b1_sp_smg_idollocean.webp',
        '94': '94_54_tetra_ssr_b1_atk_smg_volume.webp',
        '95': '95_54_tetra_ssr_b1_def_smg_rei.webp',
        '96': '96_54_tetra_ssr_b1_sp_smg_Alice_Wonderland_Bunny.webp',
        '97': '97_54_tetra_ssr_b2_def_smg_nero.webp',
        '98': '98_54_tetra_ssr_b2_sp_smg_clay.webp',
        '99': '99_54_tetra_ssr_b2_sp_smg_novel.webp',
        '9': '9_120_elysion_r_b2_def_sg_solderfa.webp',
        // Name-based mappings for backward compatibility
        'Asuka': '0_105_abnormal_ssr_b3_atk_ar_Asuka_Shikinami_Langley.webp',
        'yan': '100_56_tetra_ssr_b1_sp_rl_yan.webp',
        'alice': '101_56_tetra_ssr_b3_atk_snr_alice.webp',
        'helm': '102_597_elysion_ssr_b3_atk_snr_helm.webp',
        'emilia': '103_630_abnormal_ssr_b3_atk_rl_emilia.webp',
        '2b': '104_70_abnormal_ssr_b3_atk_ar_2b.webp',
        'soldereg': '105_70_elysion_r_b3_sp_ar_soldereg.webp',
        'rapi': '106_70_elysion_sr_B3_atk_ar_rapi.webp',
        'Helm': '107_70_elysion_ssr_b2_atk_ar_Helm_Aquamarine.webp',
        'brid': '108_70_elysion_ssr_b3_atk_ar_brid.webp',
        'guillotine': '109_70_elysion_ssr_b3_atk_ar_guillotine_winter_slayer.webp',
        'poli': '10_120_elysion_ssr_b2_def_sg_poli.webp',
        'privaty': '110_70_elysion_ssr_b3_atk_ar_privaty.webp',
        'tove': '111_70_missilis_ssr_b1_sp_ar_tove.webp',
        'sin': '112_70_missilis_ssr_b2_def_ar_sin.webp',
        'julia': '113_70_missilis_ssr_B3_atk_ar_julia.webp',
        'Rupee': '114_70_tetra_ssr_b1_def_ar_Rupee_Winter_Shopper.webp',
        'blanc': '115_70_tetra_ssr_b2_def_ar_blanc.webp',
        'folkwang': '116_70_tetra_ssr_b2_def_ar_folkwang.webp',
        'Rosanna': '117_70_tetra_ssr_b2_sp_ar_Rosanna_Chic_Ocean.webp',
        'rupee': '118_70_tetra_ssr_b3_atk_ar_rupee.webp',
        'modernia': '119_72_pilgrim_ssr_B3_atk_mg_modernia.webp',
        'marciana': '11_120_elysion_ssr_b2_sp_sg_marciana.webp',
        'rapunzel': '120_76_pilgrim_ssr_B1_snr_sp_rapunzel_pure_grace.webp',
        'Delta': '121_79_elysion_sr_b2_def_sr_Delta.webp',
        'Quency': '122_79_missilis_ssr_b3_atk_smg_Quency_Escape_Queen.webp',
        'frima': '123_79_tetra_ssr_b1_sp_snr_frima.webp',
        'Mary': '124_79_tetra_ssr_b1_sp_snr_Mary_Bay_Goddess.webp',
        'Sakura': '125_80_tetra_ssr_b3_atk_ar_Sakura_Bloom_in_Summer.webp',
        'admi': '126_81_missilis_ssr_b2_sp_snr_admi.webp',
        'ludmilla': '127_81_tetra_ssr_b1_sp_smg_ludmilla.webp',
        'sakura': '128_81_tetra_ssr_b1_sp_snr_sakura.webp',
        'yulha': '129_82_tetra_ssr_b3_atk_snr_yulha.webp',
        'ether': '12_120_missilis_ssr_b1_sp_sg_ether.webp',
        'ram': '130_84_abnormal_sr_b1_sp_snr_ram.webp',
        'Mari': '131_84_abnormal_ssr_b2_sp_snr_Mari_Makinami_Illustrious.webp',
        'D': '132_84_elysion_ssr_b1_sp_snr_D_Killer_Wife.webp',
        'helm': '133_84_elysion_ssr_b3_atk_snr_helm.webp',
        'product08': '134_84_missilis_r_b1_sp_snr_product08.webp',
        'maxwell': '135_84_missilis_ssr_b3_atk_snr_maxwell.webp',
        'trony': '136_84_missilis_ssr_b3_atk_snr_trony.webp',
        'redhood': '137_84_pilgrim_ssr_a_atk_snr_redhood.webp',
        'dorothy': '138_84_pilgrim_ssr_b1_sp_ar_dorothy.webp',
        'milk': '139_84_tetra_ssr_b1_atk_snr_milk.webp',
        'guilty': '13_120_missilis_ssr_b2_atk_sg_guilty.webp',
        'cocoa': '140_84_tetra_ssr_b1_sp_snr_cocoa.webp',
        'exia': '141_84_tetra_ssr_b1_sp_snr_exia.webp',
        'rouge': '142_84_tetra_ssr_b1_sp_snr_rouge.webp',
        'dolla': '143_84_tetra_ssr_b2_sp_snr_dolla.webp',
        'himeno': '144_87_abnormal_ssr_b2_sp_snr_himeno.webp',
        'eunhwa': '145_87_elysion_ssr_b2_atk_snr_eunhwa.webp',
        'phantom': '146_87_elysion_ssr_b3_atk_ar_phantom.webp',
        'mihara': '147_87_missilis_sr_b3_atk_ar_mihara.webp',
        'snow': '148_87_pilgrim_ssr_B3_atk_ar_snow_white.webp',
        'idollflower': '149_87_tetra_r_b1_def_rl_idollflower.webp',
        'naga': '14_120_missilis_ssr_b2_sp_sg_naga.webp',
        'idollsun': '150_87_tetra_r_b3_sp_ar_idollsun.webp',
        'moran': '151_87_tetra_ssr_B1_def_ar_moran.webp',
        'ade': '152_87_tetra_ssr_b2_sp_ar_ade.webp',
        'rei': '153_90_abnormal_ssr_b3_atk_ar_rei_ayanami_tentative_name.webp',
        'isabel': '15_120_pilgrim_ssr_B3_sg_atk_isabel.webp',
        'mary': '16_120_tetra_ssr_b1_sp_sg_mary.webp',
        'leona': '17_120_tetra_ssr_b2_sp_sg_leona.webp',
        'neve': '18_120_tetra_ssr_b3_sg_atk_neve.webp',
        'grave': '19_126_pilgrim_ssr_b2_sp_ar_grave.webp',
        'soline': '1_108_elysion_ssr_b3_atk_smg_soline.webp',
        'Privaty': '20_128_elysion_ssr_b3_atk_sg_Privaty_Unkind_Maid.webp',
        'anis': '21_130_tetra_ssr_b3_sp_sg_anis_sparkling_summer.webp',
        'mana': '22_132_missilis_ssr_b3_atk_ar_mana.webp',
        'scarletblackshadow': '23_137_pilgrim_ssr_b3_atk_rl_scarletblackshadow.webp',
        'harran': '24_145_pilgrim_ssr_b3_snr_atk_harran.webp',
        'mana': '25_149_missilis_ssr_b3_atk_ar_mana.webp',
        'scarlet': '26_157_pilgrim_ssr_b3_atk_ar_scarlet.webp',
        'power': '27_168_abnormal_ssr_b3_atk_rl_power.webp',
        'anchor': '28_168_elysion_sr_b1_def_rl_anchor.webp',
        'Anchor': '29_168_elysion_ssr_b2_sp_rl_Anchor_Innocent_Maid.webp',
        'crow': '2_108_missilis_ssr_b1_def_smg_crow.webp',
        'vesti': '30_168_elysion_ssr_b3_atk_rl_vesti.webp',
        'quiry': '31_168_elysion_ssr_b3_sp_rl_quiry.webp',
        'tia': '32_168_missilis_ssr_b1_def_rl_tia.webp',
        'Anne': '33_168_missilis_ssr_b2_sp_rl_Anne_Miracle_Fairy.webp',
        'mica': '34_168_tetra_sr_b1_sp_rl_mica.webp',
        'noise': '35_168_tetra_ssr_b1_sp_rl_noise.webp',
        'micax': '36_168_tetra_ssr_b1_sp_smg_micax.webp',
        'bay': '37_168_tetra_ssr_b2_def_rl_bay.webp',
        'biscuit': '38_168_tetra_ssr_b2_sp_rl_biscuit.webp',
        'rapunzel': '39_174_pilgrim_ssr_b1_sp_rl_rapunzel.webp',
        'quency': '3_108_missilis_ssr_b2_sp_smg_quency.webp',
        'Snow': '40_18_pilgrim_ssr_b3_atk_ar_Snow_White_Innocent_Day.webp',
        'zwei': '41_210_elysion_ssr_b1_sp_sg_zwei.webp',
        'micax2': '42_216_tetra_ssr_b1_sp_smg_micax2.webp',
        'pascal': '43_230_abnormal_sr_b1_sp_snr_pascal.webp',
        'a2': '44_234_abnormal_ssr_b3_atk_rl_a2.webp',
        'nihilister': '45_252_pilgrim_ssr_b2_snr_atk_nihilister.webp',
        'laplace': '46_261_missilis_ssr_b3_atk_rl_laplace.webp',
        'neon': '47_270_elysion_sr_b1_sp_sg_neon.webp',
        'maiden': '48_270_elysion_ssr_b3_atk_sg_maiden.webp',
        'product23': '49_270_missilis_r_b2_sp_sg_product23.webp',
        'n102': '4_112_missilis_ssr_b1_sp_rl_n102.webp',
        'pepper': '50_270_missilis_ssr_b1_sp_sg_pepper.webp',
        'drake': '51_270_missilis_ssr_b3_atk_sg_drake.webp',
        'viper': '52_270_tetra_ssr_b2_atk_sg_viper.webp',
        'noir': '53_270_tetra_ssr_b3_atk_sg_noir.webp',
        'Soda': '54_270_tetra_ssr_b3_atk_sg_Soda_Twinkling_Bunny.webp',
        'sugar': '55_270_tetra_ssr_b3_atk_sg_sugar.webp',
        'maiden': '56_273_elysion_ssr_b3_def_rl_maiden_ice_rose.webp',
        'noah': '57_360_pilgrim_ssr_b2_def_rl_noah.webp',
        'rem': '58_36_abnormal_ssr_b2_sp_mg_rem.webp',
        'asuka': '59_36_abnormal_ssr_b3_atk_ar_asuka_wille.webp',
        'yuni': '5_112_missilis_ssr_b2_def_rl_yuni.webp',
        'rei': '60_36_abnormal_ssr_b3_atk_mg_rei_ayanami.webp',
        'emma': '61_36_elysion_ssr_b1_sp_mg_emma.webp',
        'diesel': '62_36_elysion_ssr_b2_def_mg_diesel.webp',
        'Mast': '63_36_elysion_ssr_b2_sp_mg_Mast_Romantic_Maid.webp',
        'guillotine': '64_36_elysion_ssr_b3_atk_mg_guillotine.webp',
        'Neon': '65_36_elysion_ssr_b3_atk_mg_Neon_Blue_Ocean.webp',
        'red': '66_36_elysion_ssr_b3_atk_mg_red_rapi_rrh.webp',
        'product12': '67_36_missilis_r_b3_atk_mg_product12.webp',
        'eleg': '68_36_missilis_ssr_b2_sp_mg_eleg.webp',
        'kilo': '69_36_missilis_ssr_b3_def_mg_kilo.webp',
        'ein': '6_112_missilis_ssr_b3_atk_snr_ein.webp',
        'crown': '70_36_pilgrim_ssr_b2_def_mg_crown.webp',
        'cinderella': '71_36_pilgrim_ssr_B3_def_rl_cinderella.webp',
        'rosanna': '72_36_tetra_ssr_b1_atk_mg_rosanna.webp',
        'soda': '73_36_tetra_ssr_b1_sp_mg_soda.webp',
        'aria': '74_36_tetra_ssr_b2_atk_mg_aria.webp',
        'Ludmilla': '75_36_tetra_ssr_b3_atk_mg_Ludmilla_Winter_Owner.webp',
        'emilia': '76_378_abnormal_ssr_b3_atk_rl_emilia.webp',
        'rumani': '77_390_tetra_ssr_b1_def_rl_rumani.webp',
        'helm': '78_396_elysion_ssr_b3_atk_snr_helm.webp',
        'centi': '79_414_missilis_ssr_b2_def_rl_centi.webp',
        'belorta': '7_112_tetra_sr_b2_atk_rl_belorta.webp',
        'jackal': '80_426_missilis_ssr_b1_def_rl_jackal.webp',
        'anis': '81_426_tetra_sr_b2_def_rl_anis.webp',
        'trina': '82_432_missilis_ssr_b2_sp_rl_trina.webp',
        'emilia': '83_504_abnormal_ssr_b3_atk_rl_emilia.webp',
        'Misato': '84_54_abnormal_sr_b1_sp_smg_Misato_Katsuragi.webp',
        'makima': '85_54_abnormal_ssr_b2_def_smg_makima.webp',
        'solderow': '86_54_elysion_r_b1_sp_smg_solderow.webp',
        'miranda': '87_54_elysion_ssr_b1_sp_smg_miranda.webp',
        'signal': '88_54_elysion_ssr_b2_atk_smg_signal.webp',
        'mast': '89_54_elysion_ssr_b2_sp_smg_mast.webp',
        'laplace': '8_116_missilis_ssr_b3_atk_rl_laplace.webp',
        'd': '90_54_elysion_ssr_b3_atk_smg_d.webp',
        'liter': '91_54_missilis_ssr_b1_sp_smg_liter.webp',
        'epinel': '92_54_missilis_ssr_B3_atk_smg_epinel.webp',
        'idollocean': '93_54_tetra_r_b1_sp_smg_idollocean.webp',
        'volume': '94_54_tetra_ssr_b1_atk_smg_volume.webp',
        'rei': '95_54_tetra_ssr_b1_def_smg_rei.webp',
        'Alice': '96_54_tetra_ssr_b1_sp_smg_Alice_Wonderland_Bunny.webp',
        'nero': '97_54_tetra_ssr_b2_def_smg_nero.webp',
        'clay': '98_54_tetra_ssr_b2_sp_smg_clay.webp',
        'novel': '99_54_tetra_ssr_b2_sp_smg_novel.webp',
        'solderfa': '9_120_elysion_r_b2_def_sg_solderfa.webp',
    };

    // Try to find by ID mapping
    if (idMapping[id]) {
        const path = `https://raw.githubusercontent.com/sirentide/public-host/refs/heads/master/image-id/${idMapping[id]}`;
        // Found image in ID mapping
        return path;
    }

    // If all else fails, use the basic format and hope for the best
    // Use the correct GitHub URL format
    const fallbackPath = `https://raw.githubusercontent.com/sirentide/public-host/refs/heads/master/image-id/${id}_name.webp`;
    console.log(`Using fallback path for ID ${id}: ${fallbackPath}`);
    return fallbackPath;
}

// Import functions from storage.js if they're not already available
if (typeof saveTeamNames !== 'function') {
    // This will be used as a fallback if the function isn't available
    function saveTeamNames() {
        try {
            localStorage.setItem('nikkeTeamNames', JSON.stringify(teamNames));
            // console.log('Saved team names:', teamNames);
        } catch (error) {
            console.error('Error saving team names:', error);
        }
    }
}

// Function to save a team set
function saveTeamSet(name) {
    if (!name || name.trim() === '') {
        alert('Please enter a name for the team set');
        return;
    }

    // Get the current team set
    const currentTeamContainer = document.querySelector(`#teamSet${currentTeamSet}`);
    if (!currentTeamContainer) {
        console.error('Current team container not found');
        return;
    }

    // Get all teams in the current team set
    const teams = currentTeamContainer.querySelectorAll('.team-images');

    // Create an array to hold our team data
    const teamsData = [];

    // Process each team
    teams.forEach((team) => {
        // Get all images in this team
        const images = Array.from(team.querySelectorAll('.image-slot img'));

        // Add this team's data to our teams array
        teamsData.push({
            images: images.map(img => ({
                src: img.src,
                score: parseInt(img.src.split('/').pop().split('_')[0], 10) / 10
            }))
        });
    });

    // Get saved sets from localStorage
    let savedSets = {};
    try {
        const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
        if (savedSetsJson) {
            savedSets = JSON.parse(savedSetsJson);
        }
    } catch (error) {
        console.error('Error parsing saved sets:', error);
    }

    // Add the new set - ensure it's in the expected format
    savedSets[name] = {
        teams: teamsData,
        timestamp: new Date().toISOString()
    };

    // Debug the saved data structure
    // console.log('Saved team set structure:', savedSets[name]);

    // Save back to localStorage
    localStorage.setItem(SAVED_SETS_KEY, JSON.stringify(savedSets));

    // Show success message
    alert(`Team set "${name}" has been saved.`);

    // Refresh the saved sets panel if it's open
    if (document.querySelector('.saved-sets-panel')) {
        showSavedSetsPanel();
    }
}

// Function to load a team set
function loadTeamSet(name, targetSet) {
    // Get saved sets from localStorage
    let savedSets = {};
    try {
        const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
        if (savedSetsJson) {
            savedSets = JSON.parse(savedSetsJson);
        }
    } catch (error) {
        console.error('Error parsing saved sets:', error);
        return;
    }

    // Check if the set exists
    if (!savedSets[name]) {
        alert(`Team set "${name}" not found.`);
        return;
    }

    // Get the target team set container
    const targetTeamContainer = document.querySelector(`#teamSet${targetSet}`);
    if (!targetTeamContainer) {
        console.error('Target team container not found');
        return;
    }

    // Clear the target team set
    const teamRows = targetTeamContainer.querySelectorAll('.team-images');
    teamRows.forEach(row => {
        row.querySelectorAll('.image-slot').forEach(slot => {
            slot.innerHTML = '';
            slot.classList.add('empty');
        });
    });

    // Load the saved team set
    const savedTeamSet = savedSets[name];
    const savedTeams = savedTeamSet.teams;

    // Log information about the team set
    console.log(`Loading team set "${name}" with ${savedTeams.length} teams`);

    // Process each team and map it directly to a row
    // This ensures that each team in the data structure corresponds to a row in the UI
    savedTeams.forEach((team, teamIndex) => {
        // Skip if we've run out of rows
        if (teamIndex >= teamRows.length) {
            console.warn(`Warning: More teams in data (${savedTeams.length}) than rows in UI (${teamRows.length})`);
            return;
        }

        // Get the row for this team
        const teamRow = teamRows[teamIndex];
        const slots = teamRow.querySelectorAll('.image-slot');

        // Process the team based on its format
        let teamImages = [];

        if (Array.isArray(team)) {
            // Ultra-compact format - just an array of IDs
            teamImages = team.map(id => ({
                src: findFullImagePathById(id),
                type: 'id',
                id: id
            }));
        } else if (team.images && Array.isArray(team.images)) {
            // Old format with full image data
            teamImages = team.images.filter(imgData => imgData && imgData.src).map(imgData => ({
                src: imgData.src,
                type: 'full',
                score: imgData.score
            }));
        } else if (team.i && Array.isArray(team.i)) {
            // Intermediate optimized format with just filenames
            teamImages = team.i.map(filename => {
                // Extract ID from filename if possible
                let id = filename;
                if (filename.includes('_')) {
                    id = filename.split('_')[0];
                }

                return {
                    src: findFullImagePathById(id),
                    type: 'filename',
                    filename: filename,
                    id: id
                };
            });
        }

        // Log the number of images found for this team
        console.log(`Team ${teamIndex + 1}: Found ${teamImages.length} images to load`);

        // Add images to slots in this row
        teamImages.forEach((imgData, slotIndex) => {
            // Skip if we've run out of slots
            if (slotIndex >= slots.length) {
                console.warn(`Warning: More images in team ${teamIndex + 1} (${teamImages.length}) than slots in row (${slots.length})`);
                return;
            }

            // Get the slot for this image
            const slot = slots[slotIndex];

            // Create and add the image
            const img = document.createElement('img');
            img.src = imgData.src;

            // Add click handler for removal
            img.onclick = () => {
                const galleryImg = document.querySelector(`.photo img[src="${img.src}"]`);
                if (galleryImg) {
                    toggleImageSelection(galleryImg);
                } else {
                    const toggleImg = document.querySelector(`.toggle-item img[src="${img.src}"]`);
                    if (toggleImg) {
                        toggleImageSelection(toggleImg);
                    }
                }
            };

            // Add the image to the slot
            slot.innerHTML = '';
            slot.appendChild(img);
            slot.classList.remove('empty');
        });
    });

    // Log the total number of teams processed
    console.log(`Processed ${Math.min(savedTeams.length, teamRows.length)} teams`);

    // Refresh the selected state of images
    refreshSelectedImages();

    // Update team score
    updateTeamScore();

    // Extract the custom name from the saved team set name
    let customName = '';
    if (name.includes(',')) {
        // If the name has a comma, extract the part after the comma as the custom name
        customName = name.split(',').slice(1).join(',').trim();
    } else {
        // If no comma, use the whole name as the custom name
        customName = name;
    }

    // Update the team name
    if (customName) {
        teamNames[targetSet] = customName;
        updateTeamTitle(targetSet);
        // console.log(`Updated team name for set ${targetSet} to "${customName}"`);
    }

    // Update the team-specific toggle images
    if (typeof saveCurrentToggleImages === 'function') {
        saveCurrentToggleImages();
    }

    // Switch to the target team set
    switchTeamSet(targetSet);

    // Save the selection to localStorage with a slight delay to ensure all updates are processed
    setTimeout(() => {
        // Save to main storage
        saveSelectionToLocalStorage();

        // Also update the toggle tabs storage if available
        if (typeof saveToggleTabsToLocalStorage === 'function') {
            saveToggleTabsToLocalStorage();
        }

        // Save the updated team names
        saveTeamNames();

        // console.log(`Team set "${name}" loaded into ${targetSet === '1' ? 'Defender' : 'Attacker'} and saved to localStorage`);
    }, 100);

    // Show success message without using alert (which can close panels)
    const setName = targetSet === '1' ? 'Defender' : 'Attacker';
    showSuccessMessage('Team Set Loaded', `Team set "${name}" has been loaded into ${setName}.`);
}

// Function to rename a team set
function renameTeamSet(oldName, newName) {
    if (!oldName || !newName || oldName.trim() === '' || newName.trim() === '') {
        alert('Invalid team set name');
        return false;
    }

    // Get saved sets from localStorage
    let savedSets = {};
    try {
        const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
        if (savedSetsJson) {
            savedSets = JSON.parse(savedSetsJson);
        }
    } catch (error) {
        console.error('Error parsing saved sets:', error);
        return false;
    }

    // Check if the old name exists
    if (!savedSets[oldName]) {
        alert(`Team set "${oldName}" not found.`);
        return false;
    }

    // Check if the new name already exists
    if (savedSets[newName]) {
        alert(`A team set with the name "${newName}" already exists.`);
        return false;
    }

    // Rename the team set
    savedSets[newName] = savedSets[oldName];
    delete savedSets[oldName];

    // Update the timestamp
    savedSets[newName].timestamp = new Date().toISOString();

    // Save back to localStorage
    localStorage.setItem(SAVED_SETS_KEY, JSON.stringify(savedSets));

    // No alert message for rename operation
    // // console.log(`Team set renamed from "${oldName}" to "${newName}"`);
    return true;
}

// Function to delete a team set
function deleteTeamSet(name) {
    // Get saved sets from localStorage
    let savedSets = {};
    try {
        const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
        if (savedSetsJson) {
            savedSets = JSON.parse(savedSetsJson);
        }
    } catch (error) {
        console.error('Error parsing saved sets:', error);
        return;
    }

    // Check if the set exists
    if (!savedSets[name]) {
        alert(`Team set "${name}" not found.`);
        return;
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete team set "${name}"?`)) {
        return;
    }

    // Delete the set
    delete savedSets[name];

    // Save back to localStorage
    localStorage.setItem(SAVED_SETS_KEY, JSON.stringify(savedSets));

    // Show success message
    alert(`Team set "${name}" has been deleted.`);

    // Refresh the saved sets panel if it's open
    if (document.querySelector('.saved-sets-panel')) {
        showSavedSetsPanel();
    }
}

// Function to update the saved sets panel without recreating it
function updateSavedSetsPanel() {
    const existingPanel = document.querySelector('.saved-sets-panel');
    if (!existingPanel) {
        // If panel doesn't exist, create it
        showSavedSetsPanel();
        return;
    }

    // Get saved sets from localStorage
    let savedSets = {};
    try {
        const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
        if (savedSetsJson) {
            savedSets = JSON.parse(savedSetsJson);
        }
    } catch (error) {
        console.error('Error parsing saved sets:', error);
    }

    // Update the list of saved sets
    const setsList = existingPanel.querySelector('.sets-list');
    if (setsList) {
        // Get the current search query if any
        const searchInput = existingPanel.querySelector('input[type="search"]');
        const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';

        // Update the list with the current search query
        filterSavedSets(searchQuery, setsList, savedSets);
    }
}

// Function to filter saved sets based on search query
function filterSavedSets(query, setsList, savedSets) {
    // Clear the current list
    setsList.innerHTML = '';

    if (Object.keys(savedSets).length === 0) {
        const noSets = document.createElement('p');
        noSets.textContent = 'No saved team sets found.';
        noSets.style.textAlign = 'center';
        noSets.style.color = '#aaa';
        setsList.appendChild(noSets);
        return;
    }

    // Sort sets by timestamp (newest first)
    const sortedSets = Object.entries(savedSets).sort((a, b) => {
        const timeA = new Date(a[1].timestamp || 0).getTime();
        const timeB = new Date(b[1].timestamp || 0).getTime();
        return timeB - timeA;
    });

    // Filter sets based on query
    const filteredSets = sortedSets.filter(([name]) =>
        name.toLowerCase().includes(query)
    );

    if (filteredSets.length === 0) {
        const noResults = document.createElement('p');
        noResults.textContent = `No results found for "${query}"`;
        noResults.style.textAlign = 'center';
        noResults.style.color = '#aaa';
        setsList.appendChild(noResults);
        return;
    }

    // Create set items for filtered sets
    filteredSets.forEach(([name, data]) => {
        const setItem = document.createElement('div');
        setItem.className = 'set-item';
        setItem.style.backgroundColor = '#333';
        setItem.style.borderRadius = '6px';
        setItem.style.padding = '15px';
        setItem.style.marginBottom = '10px';

        // Set name and timestamp
        const setInfo = document.createElement('div');
        setInfo.style.marginBottom = '10px';
        setInfo.style.display = 'flex';
        setInfo.style.justifyContent = 'space-between';
        setInfo.style.alignItems = 'center';

        const nameContainer = document.createElement('div');
        nameContainer.style.flex = '1';

        const setName = document.createElement('h3');
        setName.textContent = name;
        setName.style.margin = '0 0 5px 0';
        nameContainer.appendChild(setName);
        setInfo.appendChild(nameContainer);

        // Add edit button
        const editButton = document.createElement('button');
        editButton.innerHTML = '✏️';
        editButton.title = 'Edit name';
        editButton.style.marginLeft = '10px';
        editButton.style.padding = '5px 10px';
        editButton.style.backgroundColor = '#444';
        editButton.style.border = 'none';
        editButton.style.borderRadius = '4px';
        editButton.style.cursor = 'pointer';
        editButton.style.fontSize = '14px';

        // Add hover effect
        editButton.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#555';
        });
        editButton.addEventListener('mouseout', function() {
            this.style.backgroundColor = '#444';
        });

        // Add click handler for editing
        editButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering the set item click

            // Create an input field to edit the name
            const input = document.createElement('input');
            input.type = 'text';
            input.value = name;
            input.style.width = '100%';
            input.style.padding = '5px';
            input.style.borderRadius = '4px';
            input.style.border = '1px solid #00aaff';
            input.style.backgroundColor = '#333';
            input.style.color = 'white';
            input.style.fontSize = '16px';

            // Replace the name with the input field
            nameContainer.innerHTML = '';
            nameContainer.appendChild(input);
            input.focus();
            input.select();

            // Handle saving the edited name
            function saveEditedName() {
                const newName = input.value.trim();
                if (newName && newName !== name) {
                    // Rename the team set in localStorage
                    const success = renameTeamSet(name, newName);

                    if (success) {
                        // Update the name variable in the closure
                        // This is crucial for subsequent edit operations
                        name = newName;

                        // Update all references to the name in this item
                        setName.textContent = newName;

                        // Update the load buttons to use the new name
                        const loadButtons = setItem.querySelectorAll('button');
                        loadButtons.forEach(button => {
                            if (button.textContent === 'Load to Defender' ||
                                button.textContent === 'Load to Attacker') {
                                // Remove old event listeners
                                const newButton = button.cloneNode(true);
                                button.parentNode.replaceChild(newButton, button);

                                // Add new event listener with updated name
                                if (newButton.textContent === 'Load to Defender') {
                                    newButton.addEventListener('click', function() {
                                        loadTeamSet(newName, '1');
                                    });
                                } else if (newButton.textContent === 'Load to Attacker') {
                                    newButton.addEventListener('click', function() {
                                        loadTeamSet(newName, '2');
                                    });
                                }
                            }
                        });

                        // Update the delete button to use the new name
                        const deleteButton = setItem.querySelector('button[style*="background-color: #9c2a2a"]');
                        if (deleteButton) {
                            const newDeleteButton = deleteButton.cloneNode(true);
                            deleteButton.parentNode.replaceChild(newDeleteButton, deleteButton);
                            newDeleteButton.addEventListener('click', function() {
                                deleteTeamSet(newName);
                            });
                        }

                        // Update the export button to use the new name
                        const exportButton = setItem.querySelector('button[style*="background-color: #555"]');
                        if (exportButton) {
                            const newExportButton = exportButton.cloneNode(true);
                            exportButton.parentNode.replaceChild(newExportButton, exportButton);
                            newExportButton.addEventListener('click', function() {
                                const shareableLink = generateShareableLink(newName);
                                if (shareableLink) {
                                    navigator.clipboard.writeText(shareableLink)
                                        .then(() => {
                                            alert('Shareable code copied to clipboard!');
                                        })
                                        .catch(err => {
                                            console.error('Could not copy link to clipboard:', err);
                                            prompt('Copy this shareable link:', shareableLink);
                                        });
                                }
                            });
                        }
                    }

                    // Restore the name container
                    nameContainer.innerHTML = '';
                    nameContainer.appendChild(setName);
                } else {
                    // Restore the original name
                    nameContainer.innerHTML = '';
                    nameContainer.appendChild(setName);
                }
            }

            // Save on Enter key
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveEditedName();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    nameContainer.innerHTML = '';
                    nameContainer.appendChild(setName);
                }
            });

            // Save on blur (when clicking outside)
            input.addEventListener('blur', saveEditedName);
        });

        setInfo.appendChild(editButton);

        if (data.timestamp) {
            const timestamp = document.createElement('div');
            timestamp.textContent = new Date(data.timestamp).toLocaleString();
            timestamp.style.fontSize = '12px';
            timestamp.style.color = '#aaa';
            nameContainer.appendChild(timestamp);
        }

        setItem.appendChild(setInfo);

        // Action buttons
        // Create two rows of actions for better organization
        const actionsContainer = document.createElement('div');
        actionsContainer.style.display = 'flex';
        actionsContainer.style.flexDirection = 'column';
        actionsContainer.style.gap = '8px';

        // First row: Load buttons
        const loadActions = document.createElement('div');
        loadActions.style.display = 'flex';
        loadActions.style.gap = '10px';

        const loadSet1Button = document.createElement('button');
        loadSet1Button.textContent = 'Load to Defender';
        loadSet1Button.style.flex = '1';
        loadSet1Button.style.padding = '8px';
        loadSet1Button.style.backgroundColor = '#2a6e9c';
        loadSet1Button.style.color = 'white';
        loadSet1Button.style.border = 'none';
        loadSet1Button.style.borderRadius = '4px';
        loadSet1Button.style.cursor = 'pointer';
        loadSet1Button.style.fontSize = '12px'; // Smaller font size
        loadSet1Button.addEventListener('click', function() {
            loadTeamSet(name, '1');
        });
        loadActions.appendChild(loadSet1Button);

        const loadSet2Button = document.createElement('button');
        loadSet2Button.textContent = 'Load to Attacker';
        loadSet2Button.style.flex = '1';
        loadSet2Button.style.padding = '8px';
        loadSet2Button.style.backgroundColor = '#2a6e9c';
        loadSet2Button.style.color = 'white';
        loadSet2Button.style.border = 'none';
        loadSet2Button.style.borderRadius = '4px';
        loadSet2Button.style.cursor = 'pointer';
        loadSet2Button.style.fontSize = '12px'; // Smaller font size
        loadSet2Button.addEventListener('click', function() {
            loadTeamSet(name, '2');
        });
        loadActions.appendChild(loadSet2Button);

        // Add the load actions to the container
        actionsContainer.appendChild(loadActions);

        // Second row: Import/Export/Delete buttons
        const utilActions = document.createElement('div');
        utilActions.style.display = 'flex';
        utilActions.style.gap = '10px';

        // Export button for this specific team set
        const exportButton = document.createElement('button');
        exportButton.textContent = 'Export';
        exportButton.style.flex = '1';
        exportButton.style.padding = '8px';
        exportButton.style.backgroundColor = '#555';
        exportButton.style.color = 'white';
        exportButton.style.border = 'none';
        exportButton.style.borderRadius = '4px';
        exportButton.style.cursor = 'pointer';
        exportButton.style.fontSize = '12px';
        exportButton.addEventListener('click', function() {
            // Generate shareable link for this team set
            const shareableLink = generateShareableLink(name);
            if (shareableLink) {
                // Copy to clipboard
                navigator.clipboard.writeText(shareableLink)
                    .then(() => {
                        alert('Shareable code copied to clipboard!');
                    })
                    .catch(err => {
                        console.error('Could not copy link to clipboard:', err);
                        // Show the link in a prompt so user can copy it manually
                        prompt('Copy this shareable link:', shareableLink);
                    });
            }
        });
        utilActions.appendChild(exportButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.style.flex = '1';
        deleteButton.style.padding = '8px';
        deleteButton.style.backgroundColor = '#9c2a2a';
        deleteButton.style.color = 'white';
        deleteButton.style.border = 'none';
        deleteButton.style.borderRadius = '4px';
        deleteButton.style.cursor = 'pointer';
        deleteButton.style.fontSize = '12px';
        deleteButton.addEventListener('click', function() {
            deleteTeamSet(name);
        });
        utilActions.appendChild(deleteButton);

        // Add the utility actions to the container
        actionsContainer.appendChild(utilActions);

        setItem.appendChild(actionsContainer);

        setsList.appendChild(setItem);
    });
}

// Function to compress team data for sharing - removed as it's no longer needed
// We now use the simpler direct ID format instead

// Function to decompress team data from a shared link - simplified for legacy support only
function decompressTeamData(compressed) {
    try {
        // Decompress using LZString
        const decompressed = LZString.decompressFromEncodedURIComponent(compressed);

        if (!decompressed) {
            throw new Error('Failed to decompress data');
        }

        // Check if it's our prefixed format
        if (decompressed.startsWith('TS:')) {
            // Remove the prefix
            const withoutPrefix = decompressed.substring(3);

            // Parse the compact string format: name|team1data|team2data
            const parts = withoutPrefix.split('|');
            const name = parts[0];

            // Parse team data (arrays of IDs)
            const teams = parts.slice(1).map(teamStr => {
                if (!teamStr) return [];
                return teamStr.split(',').filter(id => id.trim() !== '');
            });

            // Return in our internal format
            return {
                n: name,
                t: teams
            };
        }

        // Try to parse as JSON (for very old links)
        try {
            return JSON.parse(decompressed);
        } catch (e) {
            console.error('Not valid JSON:', e);
            throw new Error('Invalid data format. Could not parse the shared code.');
        }
    } catch (error) {
        console.error('Error decompressing team data:', error);
        return null;
    }
}

// Function to generate a shareable link for a team set - simplified to use only IDs
function generateShareableLink(teamSetName) {
    // Get saved sets from localStorage
    let savedSets = {};
    try {
        const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
        if (savedSetsJson) {
            savedSets = JSON.parse(savedSetsJson);
        }
    } catch (error) {
        console.error('Error parsing saved sets:', error);
        alert('Error generating link: ' + error.message);
        return null;
    }

    // Check if the team set exists
    if (!savedSets[teamSetName]) {
        alert(`Team set "${teamSetName}" not found.`);
        return null;
    }

    // Get the team data
    const teamSet = savedSets[teamSetName];
    const teams = teamSet.teams || [];

    // Extract all Nikke IDs from all teams
    const allIds = [];

    // Process each team in the set
    teams.forEach(team => {
        // Handle different data formats
        if (Array.isArray(team)) {
            // Already an array of IDs
            allIds.push(...team);
        } else if (team.images) {
            // Extract IDs from image sources
            team.images.forEach(img => {
                const src = typeof img === 'string' ? img : img.src;

                // Try to find the corresponding gallery photo to get the data-id
                const galleryPhotos = document.querySelectorAll('.gallery .photo');
                let foundId = null;

                for (const photo of galleryPhotos) {
                    const photoImg = photo.querySelector('img');
                    if (photoImg && photoImg.src === src) {
                        foundId = photo.getAttribute('data-id');
                        break;
                    }
                }

                if (foundId) {
                    // Use the data-id attribute if found
                    allIds.push(foundId);
                    // console.log(`Found data-id ${foundId} for image ${src}`);
                } else {
                    // Fallback to using the first part of the filename
                    const filename = src.split('/').pop();
                    const id = filename.split('_')[0];
                    allIds.push(id);
                    // console.log(`Using filename part ${id} for image ${src} (no data-id found)`);
                }
            });
        } else if (team.i) {
            // Extract IDs from filenames
            team.i.forEach(filename => {
                // Try to find the corresponding gallery photo to get the data-id
                const galleryPhotos = document.querySelectorAll('.gallery .photo');
                let foundId = null;

                for (const photo of galleryPhotos) {
                    const photoImg = photo.querySelector('img');
                    if (photoImg && photoImg.src.includes(filename)) {
                        foundId = photo.getAttribute('data-id');
                        break;
                    }
                }

                if (foundId) {
                    // Use the data-id attribute if found
                    allIds.push(foundId);
                } else {
                    // Fallback to using the first part of the filename
                    allIds.push(filename.split('_')[0]);
                }
            });
        }
    });

    // Create a super compact representation with the name and IDs
    // Format: name:id1xid2xid3...
    // If the name contains colons or x characters, encode it
    let encodedName = '';
    if (teamSetName) {
        // Replace any colons or x characters in the name to avoid conflicts with our format
        encodedName = teamSetName.replace(/:/g, '-colon-').replace(/x/g, '-x-');
        encodedName += ':';
    }

    const directIdCode = encodedName + allIds.join('x');

    // Wrap the code in triple backticks for easy copying in Discord
    const formattedCode = '```sharecode\n' + directIdCode + '\n```';

    // Log compression stats
    // console.log('Team set name:', teamSetName);
    // console.log('Number of Nikkes:', allIds.length);
    // console.log('Direct ID code:', directIdCode);
    // console.log('Direct ID code size:', directIdCode.length, 'bytes');
    // console.log('Formatted code for Discord:', formattedCode);

    return formattedCode;
}

// Function to export all saved team sets to a JSON file
function exportSavedTeamSets() {
    // Show a loading indicator
    const loadingIndicator = showLoadingIndicator('Preparing export...');

    // Use setTimeout to allow the loading indicator to render
    setTimeout(() => {
        try {
            // Get saved sets from localStorage
            let savedSets = {};
            try {
                const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
                if (savedSetsJson) {
                    savedSets = JSON.parse(savedSetsJson);
                }
            } catch (error) {
                console.error('Error parsing saved sets:', error);
                hideLoadingIndicator(loadingIndicator);
                showErrorMessage('Error exporting saved team sets', error.message);
                return;
            }

            // Check if there are any saved sets
            if (Object.keys(savedSets).length === 0) {
                hideLoadingIndicator(loadingIndicator);
                showInfoMessage('No saved team sets', 'No saved team sets found to export.');
                return;
            }

            // Create export data with enhanced metadata
            const exportData = {
                version: '1.1',
                type: 'nikke-portrait-saved-sets',
                timestamp: new Date().toISOString(),
                exportDate: new Date().toLocaleString(),
                setCount: Object.keys(savedSets).length,
                sets: savedSets
            };

            // Convert to JSON string
            const jsonString = JSON.stringify(exportData, null, 2); // Pretty print with 2 spaces

            // Create a Blob with the JSON data
            const blob = new Blob([jsonString], { type: 'application/json' });

            // Create a timestamp for the filename
            const now = new Date();
            const timestamp = now.getFullYear() +
                            ('0' + (now.getMonth() + 1)).slice(-2) +
                            ('0' + now.getDate()).slice(-2) + '_' +
                            ('0' + now.getHours()).slice(-2) +
                            ('0' + now.getMinutes()).slice(-2) +
                            ('0' + now.getSeconds()).slice(-2);

            // Create a download link
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `nikke_saved_team_sets_${timestamp}.json`;
            document.body.appendChild(a);

            // Trigger the download
            a.click();
            document.body.removeChild(a);

            // Clean up the URL object
            URL.revokeObjectURL(a.href);

            // Hide loading indicator and show success message
            hideLoadingIndicator(loadingIndicator);
            showSuccessMessage('Export Successful', `Successfully exported ${Object.keys(savedSets).length} team sets.`);

            // console.log('Saved team sets exported successfully as JSON file');
        } catch (error) {
            // Handle any unexpected errors
            console.error('Unexpected error during export:', error);
            hideLoadingIndicator(loadingIndicator);
            showErrorMessage('Export Failed', 'An unexpected error occurred during export: ' + error.message);
        }
    }, 100); // Short delay to ensure loading indicator appears
}

// Helper function to show a loading indicator
function showLoadingIndicator(message) {
    const loadingContainer = document.createElement('div');
    loadingContainer.className = 'loading-indicator';
    loadingContainer.style.position = 'fixed';
    loadingContainer.style.top = '0';
    loadingContainer.style.left = '0';
    loadingContainer.style.width = '100%';
    loadingContainer.style.height = '100%';
    loadingContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    loadingContainer.style.display = 'flex';
    loadingContainer.style.justifyContent = 'center';
    loadingContainer.style.alignItems = 'center';
    loadingContainer.style.zIndex = '9999';

    const loadingContent = document.createElement('div');
    loadingContent.style.backgroundColor = '#222';
    loadingContent.style.padding = '20px';
    loadingContent.style.borderRadius = '8px';
    loadingContent.style.textAlign = 'center';

    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.style.border = '4px solid #f3f3f3';
    spinner.style.borderTop = '4px solid #3498db';
    spinner.style.borderRadius = '50%';
    spinner.style.width = '30px';
    spinner.style.height = '30px';
    spinner.style.margin = '0 auto 15px auto';
    spinner.style.animation = 'spin 1s linear infinite';

    // Add keyframes for spinner animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    const loadingText = document.createElement('p');
    loadingText.textContent = message || 'Loading...';
    loadingText.style.color = 'white';
    loadingText.style.margin = '0';

    loadingContent.appendChild(spinner);
    loadingContent.appendChild(loadingText);
    loadingContainer.appendChild(loadingContent);
    document.body.appendChild(loadingContainer);

    return loadingContainer;
}

// Helper function to hide the loading indicator
function hideLoadingIndicator(loadingContainer) {
    if (loadingContainer && loadingContainer.parentNode) {
        loadingContainer.parentNode.removeChild(loadingContainer);
    }
}

// Helper function to show a success message
function showSuccessMessage(title, message) {
    const modal = document.createElement('div');
    modal.className = 'message-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';

    const content = document.createElement('div');
    content.style.backgroundColor = '#222';
    content.style.padding = '20px';
    content.style.borderRadius = '8px';
    content.style.maxWidth = '400px';
    content.style.width = '90%';
    content.style.textAlign = 'center';
    content.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';

    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.style.color = '#4CAF50';
    titleElement.style.margin = '0 0 15px 0';

    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.color = 'white';
    messageElement.style.margin = '0 0 20px 0';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'OK';
    closeButton.style.padding = '8px 16px';
    closeButton.style.backgroundColor = '#4CAF50';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    content.appendChild(titleElement);
    content.appendChild(messageElement);
    content.appendChild(closeButton);
    modal.appendChild(content);
    document.body.appendChild(modal);

    // Auto-close after 3 seconds
    setTimeout(() => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    }, 3000);
}

// Helper function to show an error message
function showErrorMessage(title, message) {
    const modal = document.createElement('div');
    modal.className = 'message-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';

    const content = document.createElement('div');
    content.style.backgroundColor = '#222';
    content.style.padding = '20px';
    content.style.borderRadius = '8px';
    content.style.maxWidth = '400px';
    content.style.width = '90%';
    content.style.textAlign = 'center';
    content.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';

    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.style.color = '#F44336';
    titleElement.style.margin = '0 0 15px 0';

    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.color = 'white';
    messageElement.style.margin = '0 0 20px 0';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'OK';
    closeButton.style.padding = '8px 16px';
    closeButton.style.backgroundColor = '#F44336';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    content.appendChild(titleElement);
    content.appendChild(messageElement);
    content.appendChild(closeButton);
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// Helper function to show an info message
function showInfoMessage(title, message) {
    const modal = document.createElement('div');
    modal.className = 'message-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';

    const content = document.createElement('div');
    content.style.backgroundColor = '#222';
    content.style.padding = '20px';
    content.style.borderRadius = '8px';
    content.style.maxWidth = '400px';
    content.style.width = '90%';
    content.style.textAlign = 'center';
    content.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';

    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.style.color = '#2196F3';
    titleElement.style.margin = '0 0 15px 0';

    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.color = 'white';
    messageElement.style.margin = '0 0 20px 0';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'OK';
    closeButton.style.padding = '8px 16px';
    closeButton.style.backgroundColor = '#2196F3';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    content.appendChild(titleElement);
    content.appendChild(messageElement);
    content.appendChild(closeButton);
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// Function to import saved team sets from a JSON file or shared code
function importSavedTeamSets() {
    // Create a modal to ask the user how they want to import
    const modalContainer = document.createElement('div');
    modalContainer.className = 'import-choice-modal import-modal-container';
    modalContainer.setAttribute('data-modal-type', 'import-choice'); // Add a data attribute for identification
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modalContainer.style.display = 'flex';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.alignItems = 'center';
    modalContainer.style.zIndex = '9999';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'import-choice-content import-modal-content';
    modalContent.style.backgroundColor = '#222';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.maxWidth = '400px';
    modalContent.style.width = '90%';
    modalContent.style.textAlign = 'center';
    modalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';

    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Import Team Sets';
    title.style.color = '#fff';
    title.style.marginTop = '0';
    title.style.marginBottom = '15px';
    modalContent.appendChild(title);

    // Add instructions
    const instructions = document.createElement('p');
    instructions.textContent = 'How would you like to import team sets?';
    instructions.style.color = '#ccc';
    instructions.style.marginBottom = '20px';
    modalContent.appendChild(instructions);

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';
    buttonContainer.style.gap = '15px';

    // Create button for importing from code
    const codeButton = document.createElement('button');
    codeButton.textContent = 'Import from Code';
    codeButton.style.flex = '1';
    codeButton.style.padding = '10px';
    codeButton.style.backgroundColor = '#2a6e9c';
    codeButton.style.color = 'white';
    codeButton.style.border = 'none';
    codeButton.style.borderRadius = '4px';
    codeButton.style.cursor = 'pointer';
    codeButton.addEventListener('click', function() {
        document.body.removeChild(modalContainer);
        showImportCodeModal();
    });
    buttonContainer.appendChild(codeButton);

    // Create button for importing from file
    const fileButton = document.createElement('button');
    fileButton.textContent = 'Import from File';
    fileButton.style.flex = '1';
    fileButton.style.padding = '10px';
    fileButton.style.backgroundColor = '#555';
    fileButton.style.color = 'white';
    fileButton.style.border = 'none';
    fileButton.style.borderRadius = '4px';
    fileButton.style.cursor = 'pointer';
    fileButton.addEventListener('click', function() {
        document.body.removeChild(modalContainer);
        importFromJsonFile();
    });
    buttonContainer.appendChild(fileButton);

    modalContent.appendChild(buttonContainer);

    // Create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.marginTop = '15px';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.backgroundColor = '#444';
    cancelButton.style.color = 'white';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.addEventListener('click', function() {
        document.body.removeChild(modalContainer);
    });
    modalContent.appendChild(cancelButton);

    // Add the modal content to the container
    modalContainer.appendChild(modalContent);

    // Add the modal container to the body
    document.body.appendChild(modalContainer);
}

// Function to show a modal for importing from a shared code
function showImportCodeModal() {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'import-modal-container';
    modalContainer.setAttribute('data-modal-type', 'import-code'); // Add a data attribute for identification
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modalContainer.style.display = 'flex';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.alignItems = 'center';
    modalContainer.style.zIndex = '9999';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'import-modal-content';
    modalContent.style.backgroundColor = '#222';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.maxWidth = '600px';
    modalContent.style.width = '90%';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflowY = 'auto';
    modalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';

    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Import Team Sets from Code';
    title.style.color = '#fff';
    title.style.marginTop = '0';
    title.style.marginBottom = '15px';
    modalContent.appendChild(title);

    // Add instructions
    const instructions = document.createElement('p');
    instructions.textContent = 'Paste the shared code below to import team sets.';
    instructions.style.color = '#ccc';
    instructions.style.marginBottom = '15px';
    modalContent.appendChild(instructions);

    // Add text area for code input
    const textArea = document.createElement('textarea');
    textArea.placeholder = 'Paste the shared code here...';
    textArea.style.width = '100%';
    textArea.style.height = '120px';
    textArea.style.padding = '10px';
    textArea.style.backgroundColor = '#333';
    textArea.style.color = '#fff';
    textArea.style.border = '1px solid #444';
    textArea.style.borderRadius = '4px';
    textArea.style.resize = 'none';
    textArea.style.marginBottom = '15px';
    modalContent.appendChild(textArea);

    // Add import button
    const importButton = document.createElement('button');
    importButton.textContent = 'Import';
    importButton.style.padding = '8px 16px';
    importButton.style.backgroundColor = '#2a6e9c';
    importButton.style.color = 'white';
    importButton.style.border = 'none';
    importButton.style.borderRadius = '4px';
    importButton.style.cursor = 'pointer';
    importButton.style.marginRight = '10px';
    importButton.addEventListener('click', function() {
        const code = textArea.value.trim();
        if (!code) {
            alert('Please enter a shared code.');
            return;
        }

        try {
            // Temporarily remove the click outside event listener to prevent panel closing
            if (window.savedSetsPanelCloseHandler) {
                document.removeEventListener('click', window.savedSetsPanelCloseHandler);
            }

            // Try to import the code
            importFromSharedCode(code);

            // Close the modal on success
            document.body.removeChild(modalContainer);

            // Refresh the saved sets panel without closing it
            const existingPanel = document.querySelector('.saved-sets-panel');
            if (existingPanel) {
                // Get saved sets from localStorage
                let savedSets = {};
                try {
                    const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
                    if (savedSetsJson) {
                        savedSets = JSON.parse(savedSetsJson);
                    }
                } catch (error) {
                    console.error('Error parsing saved sets:', error);
                }

                // Update the list of saved sets
                const setsList = existingPanel.querySelector('.sets-list');
                if (setsList) {
                    // Get the current search query if any
                    const searchInput = existingPanel.querySelector('input[type="search"]');
                    const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';

                    // Update the list with the current search query
                    filterSavedSets(searchQuery, setsList, savedSets);
                }

                // Re-add the click outside event listener
                if (window.savedSetsPanelCloseHandler) {
                    setTimeout(() => {
                        document.addEventListener('click', window.savedSetsPanelCloseHandler);
                    }, 100);
                }
            }
        } catch (error) {
            alert('Error importing from code: ' + error.message);

            // Re-add the click outside event listener in case of error
            if (window.savedSetsPanelCloseHandler) {
                setTimeout(() => {
                    document.addEventListener('click', window.savedSetsPanelCloseHandler);
                }, 100);
            }
        }
    });
    modalContent.appendChild(importButton);

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cancel';
    closeButton.style.padding = '8px 16px';
    closeButton.style.backgroundColor = '#444';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', function() {
        document.body.removeChild(modalContainer);
    });
    modalContent.appendChild(closeButton);

    // Add the modal content to the container
    modalContainer.appendChild(modalContent);

    // Add the modal container to the body
    document.body.appendChild(modalContainer);

    // Focus the text area
    setTimeout(() => {
        textArea.focus();
    }, 100);
}

// Function to import from a shared code - ultra-optimized version
function importFromSharedCode(code) {
    try {
        // Clean up the code - remove backticks and "sharecode" if present
        code = code.trim();

        // Check if the code is wrapped in backticks (for Discord formatting)
        if (code.startsWith('```') && code.endsWith('```')) {
            // Remove the backticks
            code = code.substring(3, code.length - 3).trim();

            // If it starts with "sharecode", remove that too
            if (code.toLowerCase().startsWith('sharecode')) {
                code = code.substring('sharecode'.length).trim();
            }
        }

        // Check if it's a URL with our parameter
        if (code.includes('?t=') || code.includes('?ts=') || code.includes('?teamset=')) {
            // Extract the data from the URL
            let extractedCode;
            if (code.includes('?t=')) {
                const urlParts = code.split('?t=');
                if (urlParts.length < 2) {
                    throw new Error('Invalid URL format. Could not find parameter.');
                }
                extractedCode = urlParts[1].split('&')[0]; // Get the value, ignoring other parameters
            } else if (code.includes('?ts=')) {
                const urlParts = code.split('?ts=');
                if (urlParts.length < 2) {
                    throw new Error('Invalid URL format. Could not find parameter.');
                }
                extractedCode = urlParts[1].split('&')[0];
            } else {
                const urlParts = code.split('?teamset=');
                if (urlParts.length < 2) {
                    throw new Error('Invalid URL format. Could not find parameter.');
                }
                extractedCode = urlParts[1].split('&')[0];
            }
            code = extractedCode;
        }

        // Get current saved sets
        let currentSets = {};
        const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
        if (savedSetsJson) {
            currentSets = JSON.parse(savedSetsJson);
        }

        // Check if it's our new direct ID format (contains 'x' characters)
        if (code.includes('x')) {
            // console.log('Detected direct ID code format');

            // Check if the code contains a name (format: name:id1xid2xid3...)
            let setName = `Imported Set ${new Date().toLocaleString()}`;
            let nikkeIds = [];

            if (code.includes(':')) {
                // Split the code into name and IDs
                const parts = code.split(':');
                if (parts.length >= 2) {
                    // Decode the name (replace encoded characters)
                    let decodedName = parts[0].replace(/-colon-/g, ':').replace(/-x-/g, 'x');
                    if (decodedName.trim() !== '') {
                        setName = decodedName;
                    }

                    // Extract IDs from the remaining part
                    nikkeIds = parts[1].split('x');
                }
            } else {
                // No name in the code, just IDs
                nikkeIds = code.split('x');
            }

            // console.log('Extracted IDs from direct code:', nikkeIds);
            // console.log('Using set name:', setName);

            // Log the IDs we're importing
            console.log(`Importing ${nikkeIds.length} Nikkes with IDs:`, nikkeIds);

            // Create a team with all the Nikkes
            const teamData = {
                images: nikkeIds.map(id => {
                    // Find the complete image path
                    const fullImagePath = findFullImagePathById(id);
                    console.log(`Found image path for ID ${id}: ${fullImagePath}`);

                    // Try to extract the number from the filename for score calculation
                    let score = 0;
                    try {
                        const filename = fullImagePath.split('/').pop();
                        const parts = filename.split('_');
                        if (parts.length > 1) {
                            // The second part should be the number
                            score = parseInt(parts[1], 10) / 10;
                        } else {
                            // Fallback to using the ID
                            score = parseInt(id, 10) / 10;
                        }
                    } catch (error) {
                        console.error('Error extracting score from filename:', error);
                        // Fallback to using the ID
                        score = parseInt(id, 10) / 10;
                    }

                    return {
                        src: fullImagePath,
                        score: score
                    };
                })
            };

            // Instead of creating a single team with all images, create multiple teams
            // Each team will have up to 5 images (the maximum per row)
            const teams = [];
            const images = teamData.images;

            // Log the total number of images
            console.log(`Creating team set with ${images.length} total images`);

            // Create teams with 5 images each
            for (let i = 0; i < images.length; i += 5) {
                const teamImages = images.slice(i, i + 5);
                teams.push({ images: teamImages });
                console.log(`Created team ${teams.length} with ${teamImages.length} images`);
            }

            // Create the team set structure with multiple teams
            currentSets[setName] = {
                teams: teams,
                timestamp: new Date().toISOString()
            };

            // Save back to localStorage
            localStorage.setItem(SAVED_SETS_KEY, JSON.stringify(currentSets));

            // Show success message
            const successMessage = `Successfully imported ${nikkeIds.length} Nikkes into a new team set named "${setName}".`;

            // Show the message without using alert (which closes the panel)
            showSuccessMessage('Import Successful', successMessage);

            // Show the saved sets panel if it's not already open
            if (!document.querySelector('.saved-sets-panel')) {
                showSavedSetsPanel();
            } else {
                // Update the existing panel
                updateSavedSetsPanel();
            }

            // Ask the user if they want to load the team set into Defender, Attacker, or neither
            setTimeout(() => {
                // Create a modal to ask the user where to load the team set
                const loadModalContainer = document.createElement('div');
                loadModalContainer.className = 'load-choice-modal import-modal-container';
                loadModalContainer.setAttribute('data-modal-type', 'load-choice');
                loadModalContainer.style.position = 'fixed';
                loadModalContainer.style.top = '0';
                loadModalContainer.style.left = '0';
                loadModalContainer.style.width = '100%';
                loadModalContainer.style.height = '100%';
                loadModalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                loadModalContainer.style.display = 'flex';
                loadModalContainer.style.justifyContent = 'center';
                loadModalContainer.style.alignItems = 'center';
                loadModalContainer.style.zIndex = '9999';

                // Create modal content
                const loadModalContent = document.createElement('div');
                loadModalContent.className = 'load-choice-content import-modal-content';
                loadModalContent.style.backgroundColor = '#222';
                loadModalContent.style.padding = '20px';
                loadModalContent.style.borderRadius = '8px';
                loadModalContent.style.maxWidth = '400px';
                loadModalContent.style.width = '90%';
                loadModalContent.style.textAlign = 'center';
                loadModalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';

                // Add title
                const title = document.createElement('h2');
                title.textContent = 'Load Team Set';
                title.style.color = '#fff';
                title.style.marginTop = '0';
                title.style.marginBottom = '15px';
                loadModalContent.appendChild(title);

                // Add instructions
                const instructions = document.createElement('p');
                instructions.textContent = `Where would you like to load "${setName}"?`;
                instructions.style.color = '#ccc';
                instructions.style.marginBottom = '20px';
                loadModalContent.appendChild(instructions);

                // Create button container
                const buttonContainer = document.createElement('div');
                buttonContainer.style.display = 'flex';
                buttonContainer.style.justifyContent = 'space-between';
                buttonContainer.style.gap = '15px';

                // Create button for loading to Defender
                const defenderButton = document.createElement('button');
                defenderButton.textContent = 'Load to Defender';
                defenderButton.style.flex = '1';
                defenderButton.style.padding = '10px';
                defenderButton.style.backgroundColor = '#2a6e9c';
                defenderButton.style.color = 'white';
                defenderButton.style.border = 'none';
                defenderButton.style.borderRadius = '4px';
                defenderButton.style.cursor = 'pointer';
                defenderButton.addEventListener('click', function() {
                    document.body.removeChild(loadModalContainer);
                    loadTeamSet(setName, '1');
                });
                buttonContainer.appendChild(defenderButton);

                // Create button for loading to Attacker
                const attackerButton = document.createElement('button');
                attackerButton.textContent = 'Load to Attacker';
                attackerButton.style.flex = '1';
                attackerButton.style.padding = '10px';
                attackerButton.style.backgroundColor = '#2a6e9c';
                attackerButton.style.color = 'white';
                attackerButton.style.border = 'none';
                attackerButton.style.borderRadius = '4px';
                attackerButton.style.cursor = 'pointer';
                attackerButton.addEventListener('click', function() {
                    document.body.removeChild(loadModalContainer);
                    loadTeamSet(setName, '2');
                });
                buttonContainer.appendChild(attackerButton);

                loadModalContent.appendChild(buttonContainer);

                // Create cancel button
                const cancelButton = document.createElement('button');
                cancelButton.textContent = 'Don\'t Load';
                cancelButton.style.marginTop = '15px';
                cancelButton.style.padding = '8px 16px';
                cancelButton.style.backgroundColor = '#444';
                cancelButton.style.color = 'white';
                cancelButton.style.border = 'none';
                cancelButton.style.borderRadius = '4px';
                cancelButton.style.cursor = 'pointer';
                cancelButton.addEventListener('click', function() {
                    document.body.removeChild(loadModalContainer);
                });
                loadModalContent.appendChild(cancelButton);

                // Add the modal content to the container
                loadModalContainer.appendChild(loadModalContent);

                // Add the modal container to the body
                document.body.appendChild(loadModalContainer);
            }, 500);

            return;
        }
        // Try to decompress as legacy format
        else {
            try {
                // Try to decompress the code
                let importData = decompressTeamData(code);

                if (!importData) {
                    throw new Error('Could not decompress the shared code. Please check that you copied it correctly.');
                }
            } catch (error) {
                console.error('Error decompressing team data:', error);

                // If decompression fails, try to treat it as a direct ID code without 'x'
                try {
                    // Try to parse as a single ID
                    const id = code.trim();
                    if (/^\d+$/.test(id)) {
                        // console.log('Treating as a single Nikke ID:', id);

                        // Create a new team set with this ID
                        const setName = `Imported Nikke ${new Date().toLocaleString()}`;

                        // Find the complete image path
                        const fullImagePath = findFullImagePathById(id);

                        // Try to extract the number from the filename for score calculation
                        let score = 0;
                        try {
                            const filename = fullImagePath.split('/').pop();
                            const parts = filename.split('_');
                            if (parts.length > 1) {
                                // The second part should be the number
                                score = parseInt(parts[1], 10) / 10;
                            } else {
                                // Fallback to using the ID
                                score = parseInt(id, 10) / 10;
                            }
                        } catch (error) {
                            console.error('Error extracting score from filename:', error);
                            // Fallback to using the ID
                            score = parseInt(id, 10) / 10;
                        }

                        // Create a team with this Nikke
                        const teamData = {
                            images: [{
                                src: fullImagePath,
                                score: score
                            }]
                        };

                        // Create the team set structure
                        currentSets[setName] = {
                            teams: [teamData],
                            timestamp: new Date().toISOString()
                        };

                        // Save back to localStorage
                        localStorage.setItem(SAVED_SETS_KEY, JSON.stringify(currentSets));

                        // Show success message without using alert
                        showSuccessMessage('Import Successful', `Successfully imported Nikke with ID ${id} into a new team set named "${setName}".`);

                        // Show the saved sets panel if it's not already open
                        if (!document.querySelector('.saved-sets-panel')) {
                            showSavedSetsPanel();
                        } else {
                            // Update the existing panel
                            updateSavedSetsPanel();
                        }

                        // Ask the user if they want to load the team set
                        setTimeout(() => {
                            // Create a modal to ask the user where to load the team set
                            const loadModalContainer = document.createElement('div');
                            loadModalContainer.className = 'load-choice-modal import-modal-container';
                            loadModalContainer.setAttribute('data-modal-type', 'load-choice');
                            loadModalContainer.style.position = 'fixed';
                            loadModalContainer.style.top = '0';
                            loadModalContainer.style.left = '0';
                            loadModalContainer.style.width = '100%';
                            loadModalContainer.style.height = '100%';
                            loadModalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                            loadModalContainer.style.display = 'flex';
                            loadModalContainer.style.justifyContent = 'center';
                            loadModalContainer.style.alignItems = 'center';
                            loadModalContainer.style.zIndex = '9999';

                            // Create modal content
                            const loadModalContent = document.createElement('div');
                            loadModalContent.className = 'load-choice-content import-modal-content';
                            loadModalContent.style.backgroundColor = '#222';
                            loadModalContent.style.padding = '20px';
                            loadModalContent.style.borderRadius = '8px';
                            loadModalContent.style.maxWidth = '400px';
                            loadModalContent.style.width = '90%';
                            loadModalContent.style.textAlign = 'center';
                            loadModalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';

                            // Add title
                            const title = document.createElement('h2');
                            title.textContent = 'Load Team Set';
                            title.style.color = '#fff';
                            title.style.marginTop = '0';
                            title.style.marginBottom = '15px';
                            loadModalContent.appendChild(title);

                            // Add instructions
                            const instructions = document.createElement('p');
                            instructions.textContent = `Where would you like to load "${setName}"?`;
                            instructions.style.color = '#ccc';
                            instructions.style.marginBottom = '20px';
                            loadModalContent.appendChild(instructions);

                            // Create button container
                            const buttonContainer = document.createElement('div');
                            buttonContainer.style.display = 'flex';
                            buttonContainer.style.justifyContent = 'space-between';
                            buttonContainer.style.gap = '15px';

                            // Create button for loading to Defender
                            const defenderButton = document.createElement('button');
                            defenderButton.textContent = 'Load to Defender';
                            defenderButton.style.flex = '1';
                            defenderButton.style.padding = '10px';
                            defenderButton.style.backgroundColor = '#2a6e9c';
                            defenderButton.style.color = 'white';
                            defenderButton.style.border = 'none';
                            defenderButton.style.borderRadius = '4px';
                            defenderButton.style.cursor = 'pointer';
                            defenderButton.addEventListener('click', function() {
                                document.body.removeChild(loadModalContainer);
                                loadTeamSet(setName, '1');
                            });
                            buttonContainer.appendChild(defenderButton);

                            // Create button for loading to Attacker
                            const attackerButton = document.createElement('button');
                            attackerButton.textContent = 'Load to Attacker';
                            attackerButton.style.flex = '1';
                            attackerButton.style.padding = '10px';
                            attackerButton.style.backgroundColor = '#2a6e9c';
                            attackerButton.style.color = 'white';
                            attackerButton.style.border = 'none';
                            attackerButton.style.borderRadius = '4px';
                            attackerButton.style.cursor = 'pointer';
                            attackerButton.addEventListener('click', function() {
                                document.body.removeChild(loadModalContainer);
                                loadTeamSet(setName, '2');
                            });
                            buttonContainer.appendChild(attackerButton);

                            loadModalContent.appendChild(buttonContainer);

                            // Create cancel button
                            const cancelButton = document.createElement('button');
                            cancelButton.textContent = 'Don\'t Load';
                            cancelButton.style.marginTop = '15px';
                            cancelButton.style.padding = '8px 16px';
                            cancelButton.style.backgroundColor = '#444';
                            cancelButton.style.color = 'white';
                            cancelButton.style.border = 'none';
                            cancelButton.style.borderRadius = '4px';
                            cancelButton.style.cursor = 'pointer';
                            cancelButton.addEventListener('click', function() {
                                document.body.removeChild(loadModalContainer);
                            });
                            loadModalContent.appendChild(cancelButton);

                            // Add the modal content to the container
                            loadModalContainer.appendChild(loadModalContent);

                            // Add the modal container to the body
                            document.body.appendChild(loadModalContainer);
                        }, 500);

                        return;
                    }
                } catch (singleIdError) {
                    console.error('Error treating as single ID:', singleIdError);
                }

                // If all else fails, throw the original error
                throw error;
            }

            // Handle our ultra-compact format
            if (importData.n !== undefined && importData.t !== undefined) {
                // Ultra-compact format with name and teams
                const setName = importData.n || `Imported Set ${new Date().toLocaleString()}`;

                // Flatten all IDs from all teams into a single array
                let allIds = [];
                importData.t.forEach(team => {
                    // Ensure team is an array
                    const teamArray = Array.isArray(team) ? team :
                                    (typeof team === 'string' ? team.split(',') : []);
                    allIds = allIds.concat(teamArray);
                });

                // Map all IDs to image objects
                const allImages = allIds.map(id => ({
                    // Use GitHub URL format for images
                    src: findFullImagePathById(id),
                    score: parseInt(id, 10) / 10 // Reconstruct the score
                }));

                // Instead of creating a single team with all images, create multiple teams
                // Each team will have up to 5 images (the maximum per row)
                const teams = [];

                // Log the total number of images
                console.log(`Creating team set with ${allImages.length} total images from ultra-compact format`);

                // Create teams with 5 images each
                for (let i = 0; i < allImages.length; i += 5) {
                    const teamImages = allImages.slice(i, i + 5);
                    teams.push({ images: teamImages });
                    console.log(`Created team ${teams.length} with ${teamImages.length} images`);
                }

                // Create the team set structure with multiple teams
                currentSets[setName] = {
                    teams: teams,
                    timestamp: new Date().toISOString()
                };
            }
            // Legacy format handling - minimal support for backward compatibility
            else if (importData.type && (importData.set || importData.sets)) {
                console.warn('Importing legacy format - consider updating your shared links');

                if (importData.set) {
                    // Single team set
                    const setName = importData.name || `Imported Set ${new Date().toLocaleString()}`;
                    currentSets[setName] = importData.set;
                } else if (importData.sets) {
                    // Multiple sets - just replace everything
                    currentSets = importData.sets;
                }
            }
            // Handle the intermediate format
            else if (importData.v && importData.s) {
                const setName = importData.n || `Imported Set ${new Date().toLocaleString()}`;
                currentSets[setName] = importData.s;
            }
            else {
                throw new Error('Invalid data format. This does not appear to be a valid Nikke Portrait team sets code.');
            }
        }

        // Save back to localStorage
        localStorage.setItem(SAVED_SETS_KEY, JSON.stringify(currentSets));

        // Show success message without using alert
        showSuccessMessage('Import Successful', `Successfully imported team set.`);

        // Show the saved sets panel if it's not already open
        if (!document.querySelector('.saved-sets-panel')) {
            showSavedSetsPanel();
        } else {
            // Update the existing panel
            updateSavedSetsPanel();
        }

        // Ask the user if they want to load the team set
        // Get the first team set name from the imported data
        const setNames = Object.keys(currentSets);
        if (setNames.length > 0) {
            const setName = setNames[0]; // Use the first set name

            setTimeout(() => {
                // Create a modal to ask the user where to load the team set
                const loadModalContainer = document.createElement('div');
                loadModalContainer.className = 'load-choice-modal import-modal-container';
                loadModalContainer.setAttribute('data-modal-type', 'load-choice');
                loadModalContainer.style.position = 'fixed';
                loadModalContainer.style.top = '0';
                loadModalContainer.style.left = '0';
                loadModalContainer.style.width = '100%';
                loadModalContainer.style.height = '100%';
                loadModalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                loadModalContainer.style.display = 'flex';
                loadModalContainer.style.justifyContent = 'center';
                loadModalContainer.style.alignItems = 'center';
                loadModalContainer.style.zIndex = '9999';

                // Create modal content
                const loadModalContent = document.createElement('div');
                loadModalContent.className = 'load-choice-content import-modal-content';
                loadModalContent.style.backgroundColor = '#222';
                loadModalContent.style.padding = '20px';
                loadModalContent.style.borderRadius = '8px';
                loadModalContent.style.maxWidth = '400px';
                loadModalContent.style.width = '90%';
                loadModalContent.style.textAlign = 'center';
                loadModalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';

                // Add title
                const title = document.createElement('h2');
                title.textContent = 'Load Team Set';
                title.style.color = '#fff';
                title.style.marginTop = '0';
                title.style.marginBottom = '15px';
                loadModalContent.appendChild(title);

                // Add instructions
                const instructions = document.createElement('p');
                instructions.textContent = `Where would you like to load "${setName}"?`;
                instructions.style.color = '#ccc';
                instructions.style.marginBottom = '20px';
                loadModalContent.appendChild(instructions);

                // Create button container
                const buttonContainer = document.createElement('div');
                buttonContainer.style.display = 'flex';
                buttonContainer.style.justifyContent = 'space-between';
                buttonContainer.style.gap = '15px';

                // Create button for loading to Defender
                const defenderButton = document.createElement('button');
                defenderButton.textContent = 'Load to Defender';
                defenderButton.style.flex = '1';
                defenderButton.style.padding = '10px';
                defenderButton.style.backgroundColor = '#2a6e9c';
                defenderButton.style.color = 'white';
                defenderButton.style.border = 'none';
                defenderButton.style.borderRadius = '4px';
                defenderButton.style.cursor = 'pointer';
                defenderButton.addEventListener('click', function() {
                    document.body.removeChild(loadModalContainer);
                    loadTeamSet(setName, '1');
                });
                buttonContainer.appendChild(defenderButton);

                // Create button for loading to Attacker
                const attackerButton = document.createElement('button');
                attackerButton.textContent = 'Load to Attacker';
                attackerButton.style.flex = '1';
                attackerButton.style.padding = '10px';
                attackerButton.style.backgroundColor = '#2a6e9c';
                attackerButton.style.color = 'white';
                attackerButton.style.border = 'none';
                attackerButton.style.borderRadius = '4px';
                attackerButton.style.cursor = 'pointer';
                attackerButton.addEventListener('click', function() {
                    document.body.removeChild(loadModalContainer);
                    loadTeamSet(setName, '2');
                });
                buttonContainer.appendChild(attackerButton);

                loadModalContent.appendChild(buttonContainer);

                // Create cancel button
                const cancelButton = document.createElement('button');
                cancelButton.textContent = 'Don\'t Load';
                cancelButton.style.marginTop = '15px';
                cancelButton.style.padding = '8px 16px';
                cancelButton.style.backgroundColor = '#444';
                cancelButton.style.color = 'white';
                cancelButton.style.border = 'none';
                cancelButton.style.borderRadius = '4px';
                cancelButton.style.cursor = 'pointer';
                cancelButton.addEventListener('click', function() {
                    document.body.removeChild(loadModalContainer);
                });
                loadModalContent.appendChild(cancelButton);

                // Add the modal content to the container
                loadModalContainer.appendChild(loadModalContent);

                // Add the modal container to the body
                document.body.appendChild(loadModalContainer);
            }, 500);
        }
    } catch (error) {
        console.error('Error importing from shared code:', error);
        alert('Error importing from shared code: ' + error.message);
        throw error; // Re-throw to handle in the calling function
    }
}

// Function to import from a JSON file
function importFromJsonFile() {
    // Show a loading indicator
    const loadingIndicator = showLoadingIndicator('Preparing import...');

    // Use setTimeout to allow the loading indicator to render
    setTimeout(() => {
        try {
            // Create a file input element
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);

            // Add event listener for file selection
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) {
                    hideLoadingIndicator(loadingIndicator);
                    document.body.removeChild(fileInput);
                    return;
                }

                // console.log(`Selected file: ${file.name}, size: ${file.size} bytes`);

                // Update loading message
                loadingIndicator.querySelector('p').textContent = 'Reading file...';

                // Read the file
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        // Update loading message
                        loadingIndicator.querySelector('p').textContent = 'Processing data...';

                        // Parse the JSON data
                        const jsonContent = e.target.result;
                        // console.log(`File content length: ${jsonContent.length} bytes`);

                        let importData;
                        try {
                            importData = JSON.parse(jsonContent);
                        } catch (parseError) {
                            console.error('JSON parse error:', parseError);
                            hideLoadingIndicator(loadingIndicator);
                            showErrorMessage('Import Failed', 'The file is not valid JSON. Please check the file format.');
                            document.body.removeChild(fileInput);
                            return;
                        }

                        // Validate the import data
                        if (!importData.type || importData.type !== 'nikke-portrait-saved-sets' || !importData.sets) {
                            hideLoadingIndicator(loadingIndicator);
                            showErrorMessage('Invalid File Format', 'This does not appear to be a valid Nikke Portrait saved team sets file.');
                            document.body.removeChild(fileInput);
                            return;
                        }

                        // Get current saved sets
                        let currentSets = {};
                        try {
                            const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
                            if (savedSetsJson) {
                                currentSets = JSON.parse(savedSetsJson);
                            }
                        } catch (storageError) {
                            console.error('Error reading current sets:', storageError);
                            hideLoadingIndicator(loadingIndicator);
                            showErrorMessage('Storage Error', 'Could not read your current saved sets: ' + storageError.message);
                            document.body.removeChild(fileInput);
                            return;
                        }

                        // Count the number of sets to import
                        const importCount = Object.keys(importData.sets).length;
                        const currentCount = Object.keys(currentSets).length;

                        // Hide loading indicator before showing the confirmation dialog
                        hideLoadingIndicator(loadingIndicator);

                        // Show import options dialog
                        showImportOptionsDialog(importData, importCount, currentSets, currentCount);
                        document.body.removeChild(fileInput);
                    } catch (error) {
                        console.error('Error processing import file:', error);
                        hideLoadingIndicator(loadingIndicator);
                        showErrorMessage('Import Error', 'Error processing import file: ' + error.message);
                        document.body.removeChild(fileInput);
                    }
                };

                reader.onerror = function(e) {
                    console.error('Error reading file:', e);
                    hideLoadingIndicator(loadingIndicator);
                    showErrorMessage('File Read Error', 'Could not read the file. Please try again.');
                    document.body.removeChild(fileInput);
                };

                reader.readAsText(file);
            });

            fileInput.click();
        } catch (error) {
            console.error('Unexpected error during import setup:', error);
            hideLoadingIndicator(loadingIndicator);
            showErrorMessage('Import Failed', 'An unexpected error occurred: ' + error.message);
        }
    }, 100); // Short delay to ensure loading indicator appears
}

// Function to show import options dialog
function showImportOptionsDialog(importData, importCount, currentSets, currentCount) {
    const modal = document.createElement('div');
    modal.className = 'import-options-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';

    const content = document.createElement('div');
    content.style.backgroundColor = '#222';
    content.style.padding = '20px';
    content.style.borderRadius = '8px';
    content.style.maxWidth = '500px';
    content.style.width = '90%';
    content.style.maxHeight = '90vh';
    content.style.overflowY = 'auto';
    content.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';

    const titleElement = document.createElement('h3');
    titleElement.textContent = 'Import Team Sets';
    titleElement.style.color = '#2196F3';
    titleElement.style.margin = '0 0 15px 0';
    titleElement.style.textAlign = 'center';

    const infoElement = document.createElement('p');
    infoElement.innerHTML = `Found <strong>${importCount}</strong> team sets in the import file.<br>You currently have <strong>${currentCount}</strong> saved team sets.`;
    infoElement.style.color = 'white';
    infoElement.style.margin = '0 0 20px 0';
    infoElement.style.textAlign = 'center';

    // Create a list of team sets to import
    const setsList = document.createElement('div');
    setsList.style.maxHeight = '200px';
    setsList.style.overflowY = 'auto';
    setsList.style.border = '1px solid #444';
    setsList.style.padding = '10px';
    setsList.style.marginBottom = '20px';
    setsList.style.borderRadius = '4px';

    // Add team sets to the list
    const importSets = importData.sets;
    Object.keys(importSets).forEach(setName => {
        const setItem = document.createElement('div');
        setItem.style.padding = '5px 0';
        setItem.style.borderBottom = '1px solid #333';

        const setNameSpan = document.createElement('span');
        setNameSpan.textContent = setName;
        setNameSpan.style.color = currentSets[setName] ? '#FFC107' : 'white';

        const teamCount = importSets[setName].teams ? importSets[setName].teams.length : 0;
        const teamCountSpan = document.createElement('span');
        teamCountSpan.textContent = ` (${teamCount} teams)`;
        teamCountSpan.style.color = '#999';
        teamCountSpan.style.fontSize = '0.9em';

        setItem.appendChild(setNameSpan);
        setItem.appendChild(teamCountSpan);

        if (currentSets[setName]) {
            const warningSpan = document.createElement('span');
            warningSpan.textContent = ' - Will be overwritten';
            warningSpan.style.color = '#FFC107';
            warningSpan.style.fontSize = '0.9em';
            setItem.appendChild(warningSpan);
        }

        setsList.appendChild(setItem);
    });

    // Options section
    const optionsSection = document.createElement('div');
    optionsSection.style.marginBottom = '20px';

    const optionsTitle = document.createElement('h4');
    optionsTitle.textContent = 'Import Options';
    optionsTitle.style.color = 'white';
    optionsTitle.style.margin = '0 0 10px 0';

    // Create radio buttons for import options
    const optionReplace = createRadioOption('replace', 'Replace all existing team sets', 'This will delete all your current team sets and replace them with the imported ones.');
    const optionMerge = createRadioOption('merge', 'Merge with existing team sets', 'This will add the imported team sets to your current ones. If a team set with the same name exists, it will be overwritten.');
    const optionSkip = createRadioOption('skip', 'Skip existing team sets', 'This will only import team sets that don\'t already exist in your collection.');

    // Select merge by default
    optionMerge.querySelector('input').checked = true;

    optionsSection.appendChild(optionsTitle);
    optionsSection.appendChild(optionReplace);
    optionsSection.appendChild(optionMerge);
    optionsSection.appendChild(optionSkip);

    // Buttons section
    const buttonsSection = document.createElement('div');
    buttonsSection.style.display = 'flex';
    buttonsSection.style.justifyContent = 'space-between';
    buttonsSection.style.marginTop = '20px';

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.backgroundColor = '#555';
    cancelButton.style.color = 'white';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.style.minWidth = '100px';
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    const importButton = document.createElement('button');
    importButton.textContent = 'Import';
    importButton.style.padding = '8px 16px';
    importButton.style.backgroundColor = '#2196F3';
    importButton.style.color = 'white';
    importButton.style.border = 'none';
    importButton.style.borderRadius = '4px';
    importButton.style.cursor = 'pointer';
    importButton.style.minWidth = '100px';
    importButton.addEventListener('click', () => {
        // Get selected option
        const selectedOption = document.querySelector('input[name="import-option"]:checked').value;

        // Show loading indicator
        document.body.removeChild(modal);
        const loadingIndicator = showLoadingIndicator('Importing team sets...');

        // Process the import based on selected option
        setTimeout(() => {
            try {
                let resultMessage = '';

                if (selectedOption === 'replace') {
                    // Replace all existing sets with imported sets
                    localStorage.setItem(SAVED_SETS_KEY, JSON.stringify(importData.sets));
                    resultMessage = `Replaced all existing team sets with ${importCount} imported sets.`;
                } else if (selectedOption === 'merge') {
                    // Merge imported sets with existing sets
                    const mergedSets = { ...currentSets, ...importData.sets };
                    localStorage.setItem(SAVED_SETS_KEY, JSON.stringify(mergedSets));
                    resultMessage = `Merged ${importCount} imported sets with your existing team sets.`;
                } else if (selectedOption === 'skip') {
                    // Only import sets that don't already exist
                    const newSets = {};
                    let newCount = 0;

                    Object.keys(importData.sets).forEach(setName => {
                        if (!currentSets[setName]) {
                            newSets[setName] = importData.sets[setName];
                            newCount++;
                        }
                    });

                    // Merge only new sets
                    const mergedSets = { ...currentSets, ...newSets };
                    localStorage.setItem(SAVED_SETS_KEY, JSON.stringify(mergedSets));
                    resultMessage = `Imported ${newCount} new team sets, skipped ${importCount - newCount} existing sets.`;
                }

                // Update the saved sets panel in place if it's open
                if (document.querySelector('.saved-sets-panel')) {
                    updateSavedSetsPanel();
                }

                // Hide loading indicator and show success message
                hideLoadingIndicator(loadingIndicator);
                showSuccessMessage('Import Successful', resultMessage);
            } catch (error) {
                console.error('Error during import processing:', error);
                hideLoadingIndicator(loadingIndicator);
                showErrorMessage('Import Failed', 'An error occurred during import: ' + error.message);
            }
        }, 500);
    });

    buttonsSection.appendChild(cancelButton);
    buttonsSection.appendChild(importButton);

    // Assemble the modal
    content.appendChild(titleElement);
    content.appendChild(infoElement);
    content.appendChild(setsList);
    content.appendChild(optionsSection);
    content.appendChild(buttonsSection);
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// Helper function to create a radio option
function createRadioOption(value, label, description) {
    const optionContainer = document.createElement('div');
    optionContainer.style.marginBottom = '10px';

    const radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.name = 'import-option';
    radioInput.value = value;
    radioInput.id = `option-${value}`;
    radioInput.style.marginRight = '8px';

    const labelElement = document.createElement('label');
    labelElement.htmlFor = `option-${value}`;
    labelElement.textContent = label;
    labelElement.style.color = 'white';
    labelElement.style.fontWeight = 'bold';

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = description;
    descriptionElement.style.color = '#ccc';
    descriptionElement.style.margin = '2px 0 0 24px';
    descriptionElement.style.fontSize = '0.9em';

    optionContainer.appendChild(radioInput);
    optionContainer.appendChild(labelElement);
    optionContainer.appendChild(descriptionElement);

    return optionContainer;
}

// Function to show a dialog for selecting which team set to share
function showShareDialog(setNames) {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'share-dialog-container';
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modalContainer.style.display = 'flex';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.alignItems = 'center';
    modalContainer.style.zIndex = '9999';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'share-dialog-content';
    modalContent.style.backgroundColor = '#222';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.maxWidth = '600px';
    modalContent.style.width = '90%';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflowY = 'auto';
    modalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';

    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Select Team Set to Share';
    title.style.color = '#fff';
    title.style.marginTop = '0';
    title.style.marginBottom = '15px';
    modalContent.appendChild(title);

    // Add instructions
    const instructions = document.createElement('p');
    instructions.textContent = 'Choose which team set you want to share:';
    instructions.style.color = '#ccc';
    instructions.style.marginBottom = '15px';
    modalContent.appendChild(instructions);

    // Create list of sets
    const setsList = document.createElement('div');
    setsList.className = 'sets-list';
    setsList.style.marginBottom = '20px';

    // Add each set as a button
    setNames.forEach(name => {
        const setButton = document.createElement('button');
        setButton.textContent = name;
        setButton.style.display = 'block';
        setButton.style.width = '100%';
        setButton.style.padding = '10px';
        setButton.style.marginBottom = '8px';
        setButton.style.backgroundColor = '#333';
        setButton.style.color = 'white';
        setButton.style.border = '1px solid #444';
        setButton.style.borderRadius = '4px';
        setButton.style.cursor = 'pointer';
        setButton.style.textAlign = 'left';
        setButton.style.fontSize = '14px';

        // Add hover effect
        setButton.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#444';
        });
        setButton.addEventListener('mouseout', function() {
            this.style.backgroundColor = '#333';
        });

        // Add click handler
        setButton.addEventListener('click', function() {
            // Generate shareable link for this set
            const shareableLink = generateShareableLink(name);
            if (shareableLink) {
                // Copy to clipboard
                navigator.clipboard.writeText(shareableLink)
                    .then(() => {
                        alert('Shareable code copied to clipboard!');
                        // Close the modal
                        document.body.removeChild(modalContainer);
                    })
                    .catch(err => {
                        console.error('Could not copy link to clipboard:', err);
                        // Show the link in a prompt so user can copy it manually
                        prompt('Copy this shareable link:', shareableLink);
                        // Close the modal
                        document.body.removeChild(modalContainer);
                    });
            } else {
                // Close the modal
                document.body.removeChild(modalContainer);
            }
        });

        setsList.appendChild(setButton);
    });

    modalContent.appendChild(setsList);

    // Add cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.backgroundColor = '#444';
    cancelButton.style.color = 'white';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.addEventListener('click', function() {
        document.body.removeChild(modalContainer);
    });
    modalContent.appendChild(cancelButton);

    // Add the modal content to the container
    modalContainer.appendChild(modalContent);

    // Add the modal container to the body
    document.body.appendChild(modalContainer);
}

// Function to show the saved sets panel
function showSavedSetsPanel() {
    // Remove existing panel if any
    const existingPanel = document.querySelector('.saved-sets-panel');
    if (existingPanel) {
        existingPanel.remove();
    }

    // Get saved sets from localStorage
    let savedSets = {};
    try {
        const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
        if (savedSetsJson) {
            savedSets = JSON.parse(savedSetsJson);
        }
    } catch (error) {
        console.error('Error parsing saved sets:', error);
    }

    // Create the panel
    const panel = document.createElement('div');
    panel.className = 'saved-sets-panel';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.maxHeight = '80vh';
    panel.style.overflow = 'hidden'; // Hide overflow for the panel itself

    // Create fixed header container
    const fixedHeaderContainer = document.createElement('div');
    fixedHeaderContainer.className = 'saved-sets-fixed-header';
    fixedHeaderContainer.style.flex = '0 0 auto'; // Don't allow the header to grow or shrink
    fixedHeaderContainer.style.borderBottom = '1px solid #333';
    fixedHeaderContainer.style.boxShadow = '0 4px 6px -2px rgba(0, 0, 0, 0.3)';

    // Create header
    const header = document.createElement('div');
    header.className = 'saved-sets-header';
    header.style.position = 'relative'; // Make it a positioning context for the close button

    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Saved Team Sets';
    title.style.margin = '0';
    title.style.textAlign = 'center';
    title.style.width = '100%';
    header.appendChild(title);

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-saved-sets-btn';
    closeBtn.innerHTML = '&#10005;'; // ✕ symbol
    closeBtn.addEventListener('click', function() {
        panel.remove();
    });

    // Add the close button to the header
    header.appendChild(closeBtn);

    // Add the header to the fixed header container
    fixedHeaderContainer.appendChild(header);

    // Add the fixed header container to the panel
    panel.appendChild(fixedHeaderContainer);

    // Create a scrollable container for the content
    const scrollableContent = document.createElement('div');
    scrollableContent.className = 'saved-sets-scrollable-content';
    scrollableContent.style.flex = '1 1 auto'; // Allow it to grow and shrink
    scrollableContent.style.overflowY = 'auto'; // Make it scrollable
    scrollableContent.style.paddingRight = '10px'; // Add some padding for the scrollbar

    // Add the scrollable content container to the panel
    panel.appendChild(scrollableContent);

    // Create save form
    const saveForm = document.createElement('div');
    saveForm.className = 'save-form';
    saveForm.style.display = 'flex';
    saveForm.style.marginBottom = '20px';
    saveForm.style.gap = '10px';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Enter a name for your team set';
    nameInput.style.flex = '1';
    nameInput.style.padding = '8px';
    nameInput.style.borderRadius = '4px';
    nameInput.style.border = '1px solid #444';
    nameInput.style.backgroundColor = '#333';
    nameInput.style.color = 'white';

    // Add event listener for Enter key
    nameInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            saveTeamSet(nameInput.value);
        }
    });

    // Pre-fill with current team name if available
    const currentSetId = currentTeamSet; // '1' for Defender, '2' for Attacker
    const customName = teamNames[currentSetId] || '';

    // Use only the custom name if available, otherwise leave empty
    nameInput.value = customName;

    saveForm.appendChild(nameInput);

    // Focus and select the text in the input field after a short delay
    // (to ensure the panel is fully rendered)
    setTimeout(() => {
        nameInput.focus();
        nameInput.select();
    }, 100);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Current';
    saveButton.style.padding = '8px 15px';
    saveButton.style.backgroundColor = '#2a6e9c';
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';
    saveButton.addEventListener('click', function() {
        saveTeamSet(nameInput.value);
    });
    saveForm.appendChild(saveButton);

    fixedHeaderContainer.appendChild(saveForm);

    // Create a container for import/export buttons
    const importExportContainer = document.createElement('div');
    importExportContainer.className = 'import-export-container';
    importExportContainer.style.display = 'flex';
    importExportContainer.style.justifyContent = 'space-between';
    importExportContainer.style.marginBottom = '15px';
    importExportContainer.style.gap = '10px';

    // Create export button
    const exportButton = document.createElement('button');
    exportButton.textContent = 'Export All Sets';
    exportButton.style.padding = '8px 12px';
    exportButton.style.backgroundColor = '#2a6e9c';
    exportButton.style.color = 'white';
    exportButton.style.border = 'none';
    exportButton.style.borderRadius = '4px';
    exportButton.style.cursor = 'pointer';
    exportButton.style.fontSize = '12px';
    exportButton.style.flex = '1';
    exportButton.addEventListener('click', function() {
        exportSavedTeamSets();
    });
    // Add hover effects
    exportButton.addEventListener('mouseover', function() {
        this.style.backgroundColor = '#3a8ebc';
    });
    exportButton.addEventListener('mouseout', function() {
        this.style.backgroundColor = '#2a6e9c';
    });
    importExportContainer.appendChild(exportButton);

    // Create import from code button
    const importCodeButton = document.createElement('button');
    importCodeButton.textContent = 'Import from Code';
    importCodeButton.style.padding = '8px 12px';
    importCodeButton.style.backgroundColor = '#555';
    importCodeButton.style.color = 'white';
    importCodeButton.style.border = 'none';
    importCodeButton.style.borderRadius = '4px';
    importCodeButton.style.cursor = 'pointer';
    importCodeButton.style.fontSize = '12px';
    importCodeButton.style.flex = '1';
    importCodeButton.addEventListener('click', function() {
        showImportCodeModal();
    });
    // Add hover effects
    importCodeButton.addEventListener('mouseover', function() {
        this.style.backgroundColor = '#666';
    });
    importCodeButton.addEventListener('mouseout', function() {
        this.style.backgroundColor = '#555';
    });
    importExportContainer.appendChild(importCodeButton);

    // Create import button
    const importButton = document.createElement('button');
    importButton.textContent = 'Import from File';
    importButton.style.padding = '8px 12px';
    importButton.style.backgroundColor = '#555';
    importButton.style.color = 'white';
    importButton.style.border = 'none';
    importButton.style.borderRadius = '4px';
    importButton.style.cursor = 'pointer';
    importButton.style.fontSize = '12px';
    importButton.style.flex = '1';
    importButton.addEventListener('click', function() {
        importSavedTeamSets();
    });
    // Add hover effects
    importButton.addEventListener('mouseover', function() {
        this.style.backgroundColor = '#666';
    });
    importButton.addEventListener('mouseout', function() {
        this.style.backgroundColor = '#555';
    });
    importExportContainer.appendChild(importButton);

    fixedHeaderContainer.appendChild(importExportContainer);

    // Create search form
    const searchForm = document.createElement('div');
    searchForm.className = 'search-form';
    searchForm.style.display = 'flex';
    searchForm.style.marginBottom = '20px';
    searchForm.style.gap = '10px';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search saved team sets...';
    searchInput.style.flex = '1';
    searchInput.style.padding = '8px';
    searchInput.style.borderRadius = '4px';
    searchInput.style.border = '1px solid #444';
    searchInput.style.backgroundColor = '#333';
    searchInput.style.color = 'white';
    searchInput.addEventListener('input', function() {
        // Filter the saved sets based on search input
        filterSavedSets(this.value.toLowerCase(), setsList, savedSets);
    });
    searchForm.appendChild(searchInput);

    fixedHeaderContainer.appendChild(searchForm);

    // Create list of saved sets
    const setsList = document.createElement('div');
    setsList.className = 'sets-list';

    // Initialize with all sets (empty search query)
    filterSavedSets('', setsList, savedSets);

    scrollableContent.appendChild(setsList);

    // Add some bottom padding
    const bottomPadding = document.createElement('div');
    bottomPadding.style.height = '20px';
    scrollableContent.appendChild(bottomPadding);

    // Add the panel to the body
    document.body.appendChild(panel);
}

// Function to show a success message
function showSuccessMessage(title, message) {
    const successContainer = document.createElement('div');
    successContainer.className = 'success-message';
    successContainer.style.position = 'fixed';
    successContainer.style.top = '20px';
    successContainer.style.right = '20px';
    successContainer.style.maxWidth = '300px';
    successContainer.style.backgroundColor = '#222';
    successContainer.style.padding = '15px';
    successContainer.style.borderRadius = '8px';
    successContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    successContainer.style.zIndex = '9999';
    successContainer.style.borderLeft = '4px solid #4CAF50';

    const titleElement = document.createElement('h3');
    titleElement.textContent = title || 'Success';
    titleElement.style.color = '#4CAF50';
    titleElement.style.margin = '0 0 10px 0';
    titleElement.style.fontSize = '16px';

    const messageElement = document.createElement('p');
    messageElement.textContent = message || 'Operation completed successfully.';
    messageElement.style.color = 'white';
    messageElement.style.margin = '0';
    messageElement.style.fontSize = '14px';

    successContainer.appendChild(titleElement);
    successContainer.appendChild(messageElement);
    document.body.appendChild(successContainer);

    // Automatically remove the message after 5 seconds
    setTimeout(() => {
        if (successContainer && successContainer.parentNode) {
            successContainer.style.opacity = '0';
            successContainer.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                if (successContainer && successContainer.parentNode) {
                    successContainer.parentNode.removeChild(successContainer);
                }
            }, 500);
        }
    }, 5000);

    return successContainer;
}