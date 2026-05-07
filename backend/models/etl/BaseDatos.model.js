const db = require('../../config/db');

const getAll = async () => {
    try {
        const sql = `
            SELECT 
                p.people_id,
                p.document_number as cedula,
                CONCAT(p.first_name, ' ', p.last_name) as apellidos_nombres,
                p.email as correo_electronico,
                p.phone_number as telefono,
                p.birthdate as fecha_nacimiento,
                p.registration_date as fecha_ingreso_empresa,
                
                pd.address as direccion,
                pd.neighborhood as barrio,
                pd.stratum as estrato,
                pd.partner_name,
                pd.children_count as nro_hijos,
                pd.size_shirt as t_camisa,
                pd.size_jean as t_pantalon,
                pd.size_shoes as t_zapatos,
                pd.size_jacket as t_chaquetas,
                pd.size_vest as t_chalecos,
                
                bpd.salary as sueldo_2026,
                bpd.start_date as fecha_ingreso,
                bpd.termination_date as fecha_retiro,
                bpd.notes as observaciones,
                
                mjt.job_title as cargo,
                moff.name as oficina,
                mc.name_contract as tipo_contrato,
                mcl.name as cliente,
                mci.name as ciudad,
                cc.helisa_cc as ceco,
                mco.name as empresa,
                ma.name as zona,
                mu.name as unidad_negocio,
                
                me.name_eps as salud,
                mp.name_fund as pension,
                mcb.name_compesation_box as caja,
                phs.bank_account as cuenta_bancaria,
                
                pei.name_emergency as nombre_contacto_emergencia,
                pei.number_phone_emergency as cel_emergencia,
                pei.contact_relationship as parentesco_contacto
                
            FROM people p
            LEFT JOIN people_details pd ON p.details_id = pd.details_id
            LEFT JOIN business_people_data bpd ON p.people_business_id = bpd.people_business_id
            LEFT JOIN people_extended_info pei ON p.people_id = pei.people_id
            LEFT JOIN people_healt_security phs ON p.people_id = phs.people_id
            
            LEFT JOIN master_job_titles mjt ON bpd.job_title = mjt.id_job
            LEFT JOIN master_contracts mc ON bpd.contract_id = mc.contract_id
            LEFT JOIN master_client mcl ON bpd.client_id = mcl.client_id
            LEFT JOIN master_cities mci ON bpd.city_work_id = mci.city_id
            LEFT JOIN master_offices moff ON bpd.office_id = moff.office_id
            LEFT JOIN cost_center cc ON bpd.cost_center_id = cc.cost_center_id
            LEFT JOIN master_company mco ON bpd.company_id = mco.company_id
            LEFT JOIN master_area ma ON bpd.area_id = ma.area_id
            LEFT JOIN master_unit mu ON bpd.unit_id = mu.unit_id
            LEFT JOIN master_eps me ON phs.eps_id = me.eps_id
            LEFT JOIN master_pension mp ON phs.pension_id = mp.pension_id
            LEFT JOIN master_compensation_box mcb ON phs.compensation_box_id = mcb.compesation_box_id
            
            ORDER BY p.people_id ASC
        `;
        const [rows] = await db.query(sql);
        return rows;
    } catch (error) {
        console.error('Error in BaseDatos.model.getAll:', error);
        throw error;
    }
};

module.exports = { getAll };
