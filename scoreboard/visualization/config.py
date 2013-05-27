"""Common configuration constants
"""
PROJECTNAME = 'scoreboard.visualization'

ADD_PERMISSIONS = {
    'ScoreboardVisualization':
        'scoreboard.visualization: Add ScoreboardVisualization',
}

from zope.i18nmessageid.message import MessageFactory
_ = MessageFactory('scoreboard')

# This list is used by country_profile chart and can be customized within
# ZMI > portal_properties > scoreboard_properties
EU = {
    "BE": "Belgium",
    "BG": "Bulgaria",
    "CZ": "Czech Republic",
    "DK": "Denmark",
    "DE": "Germany",
    "EE": "Estonia",
    "IE": "Ireland",
    "EL": "Greece",
    "ES": "Spain",
    "FR": "France",
    "IT": "Italy",
    "CY": "Cyprus",
    "LV": "Latvia",
    "LT": "Lithuania",
    "LU": "Luxembourg",
    "HU": "Hungary",
    "MT": "Malta",
    "NL": "Netherlands",
    "AT": "Austria",
    "PL": "Poland",
    "PT": "Portugal",
    "RO": "Romania",
    "SI": "Slovenia",
    "SK": "Slovakia",
    "FI": "Finland",
    "SE": "Sweden",
    "UK": "United Kingdom"
}

# This list is used by country_profile chart and can be customized within
# ZMI > portal_properties > scoreboard_properties
WHITELIST = [

    {'indicator': 'bb_fcov', 'breakdown': 'total_pop', 'unit-measure': 'pc_pop'},
    {'indicator': 'bb_fcov', 'breakdown': 'rural_pop', 'unit-measure': 'pc_rural_pop'},
    {'indicator': 'bb_ne', 'breakdown': 'total_fbb', 'unit-measure': 'pc_lines'},
    {'indicator': 'h_broad', 'breakdown': 'hh_total', 'unit-measure': 'pc_hh'},
    {'indicator': 'e_broad', 'breakdown': 'ent_all_xfin', 'unit-measure': 'pc_ent'},
    
    {'indicator': 'e_sisorp', 'breakdown': 'ent_l_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'e_sisorp', 'breakdown': 'ent_sm_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'e_crman', 'breakdown': 'ent_all_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'e_ade', 'breakdown': 'ent_l_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'e_ade', 'breakdown': 'ent_sm_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'e_inv', 'breakdown': 'ent_all_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'e_sisc', 'breakdown': 'ent_l_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'e_sisc', 'breakdown': 'ent_sm_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'e_rfid', 'breakdown': 'ent_all_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'e_empmd_gt20', 'breakdown': 'ent_l_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'e_empmd_gt20', 'breakdown': 'ent_sm_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'P_EMPMD', 'breakdown': 'ent_all_xfin', 'unit-measure': 'PC_EMP'},
    {'indicator': 'e_ra', 'breakdown': 'ent_all_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'E_ERP1', 'breakdown': 'ent_l_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'E_ERP1', 'breakdown': 'ent_sm_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'E_WEB', 'breakdown': 'ent_all_xfin', 'unit-measure': 'pc_ent'},
    
    {'indicator': 'i_blt12', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind'},
    {'indicator': 'i_blt12', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind_ilt12'},
    {'indicator': 'i_bfeu', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind'},
    {'indicator': 'i_bfeu', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind_ilt12'},
    {'indicator': 'i_iusell', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind_iu3'},
    {'indicator': 'i_bgoodo', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind_ilt12'},
    {'indicator': 'e_eturn', 'breakdown': 'ent_l_xfin', 'unit-measure': 'pc_turn'},
    {'indicator': 'e_eturn', 'breakdown': 'ent_sm_xfin', 'unit-measure': 'pc_turn'},
    {'indicator': 'e_ebuy', 'breakdown': 'ent_l_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'e_ebuy', 'breakdown': 'ent_sm_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'e_esell', 'breakdown': 'ent_l_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'e_esell', 'breakdown': 'ent_sm_xfin', 'unit-measure': 'pc_ent'},

    {'indicator': 'i_iugov12', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind'},
    {'indicator': 'i_igov12rt', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind'},
    {'indicator': 'e_igov', 'breakdown': 'ent_all_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'e_igovrt', 'breakdown': 'ent_all_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'e_igov2pr', 'breakdown': 'ent_all_xfin', 'unit-measure': 'pc_ent'},

    {'indicator': 'i_cprg', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind'},
    {'indicator': 'i_cweb', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind'},
    {'indicator': 'i_csk_ge_me', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind'},
    {'indicator': 'i_isk_ge_me', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind'},
    {'indicator': 'i_skedu', 'breakdown': 'y16_24', 'unit-measure': 'pc_ind'},
    {'indicator': 'i_skedu', 'breakdown': 'y25_54', 'unit-measure': 'pc_ind'},
    {'indicator': 'i_cisk_sfjobx', 'breakdown': 'sal_self_fam', 'unit-measure': 'pc_ind'},
    {'indicator': 'i_cisk_sfjob', 'breakdown': 'sal_self_fam', 'unit-measure': 'pc_ind'},
    {'indicator': 'P_IUSE', 'breakdown': 'ent_all_xfin', 'unit-measure': 'pc_emp'},
    {'indicator': 'E_ITSP2', 'breakdown': 'ent_all_xfin', 'unit-measure': 'pc_ent'},
    {'indicator': 'E_ITSPVAC2', 'breakdown': 'ent_all_xfin', 'unit-measure': 'pc_ent'},

    {'indicator': 'i_iuif', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind_iu3'},
    {'indicator': 'i_iunw', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind_iu3'},
    {'indicator': 'i_iugm', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind_iu3'},
    {'indicator': 'i_iubk', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind_iu3'},
    {'indicator': 'i_iuupl', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind_iu3'},
    {'indicator': 'i_ihif', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind_iu3'},
    {'indicator': 'i_iujob', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind_iu3'},
    {'indicator': 'i_iuolc', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind_iu3'},
    {'indicator': 'i_iueduif', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind_iu3'},
    {'indicator': 'i_iugov', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind_iu3'},
    {'indicator': 'i_igovrt', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind_iu3'},
    {'indicator': 'i_iusnet', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind_iu3'},
    {'indicator': 'i_iuvote', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind_iu3'},
    {'indicator': 'I_IUMAPP', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind_iu3'},
    {'indicator': 'I_IUPH1', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind_iu3'},
    
    {'indicator': 'h_iacc', 'breakdown': 'hh_total', 'unit-measure': 'pc_hh'},
    {'indicator': 'i_iuse', 'breakdown': 'rf_ge1', 'unit-measure': 'pc_ind'},
    {'indicator': 'i_iuse', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind'},
    {'indicator': 'i_iday', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind'},
    {'indicator': 'i_iumc', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind'},
    {'indicator': 'i_iux', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind'},
    {'indicator': 'i_ia12ave', 'breakdown': 'y16_24', 'unit-measure': 'ia12ave'},
    {'indicator': 'i_ia12ave', 'breakdown': 'y25_54', 'unit-measure': 'ia12ave'},
    {'indicator': 'i_ia12ave', 'breakdown': 'y55_74', 'unit-measure': 'ia12ave'},

    {'indicator': 'mbb_3gcov', 'breakdown': 'total_pop', 'unit-measure': 'pc_pop'},
    {'indicator': 'mob_arpu', 'breakdown': 'total_mob', 'unit-measure': 'euro'},
    {'indicator': 'mob_arpm', 'breakdown': 'total_mob', 'unit-measure': 'euro'},
    {'indicator': 'mob_ms', 'breakdown': 'total_mob', 'unit-measure': 'pc_subs'},
    {'indicator': 'i_iu3g', 'breakdown': 'ind_total', 'unit-measure': 'pc_ind'},
    {'indicator': 'e_pmd', 'breakdown': 'ent_all_xfin', 'unit-measure': 'pc_ent'},

    {'indicator': 'gbaord_ict', 'breakdown': 'total', 'unit-measure': 'pc_gbaord'},

    {'indicator': 'tel_invrev', 'breakdown': 'total_telecom', 'unit-measure': 'pc_revenue'}

]
