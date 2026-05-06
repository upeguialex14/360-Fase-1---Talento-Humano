const db = require('../../../config/db');
const { excelDateToJS } = require('../../../helpers/excel.helper');

const process = async (jsonData) => {
    let processed = 0;
    let inserted = 0;
    let errors = [];
    
    // Normalize headers
    const normalizedData = jsonData.map(row => {
        const normalizedRow = {};
        for (const [key, value] of Object.entries(row)) {
            const normalizedKey = key.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
                .replace(/\s+/g, '_') // spaces to underscores
                .replace(/[^a-z0-9_]/g, ''); // remove non-alphanumeric except underscores
            normalizedRow[normalizedKey] = value;
        }
        return { original: row, normalized: normalizedRow };
    });

    // 1. PRECARGA DE MAESTROS PARA SEGURIDAD SOCIAL
    const [epsList, pensionList, arlList, ccfList] = await Promise.all([
        db.query('SELECT eps_id as id, name_eps as nombre FROM MASTER_EPS').then(([rows]) => rows),
        db.query('SELECT pension_id as id, name_fund as nombre FROM MASTER_PENSION').then(([rows]) => rows),
        db.query('SELECT arl_id as id, name_arl as nombre FROM MASTER_ARL').then(([rows]) => rows),
        db.query('SELECT compesation_box_id as id, name_compesation_box as nombre FROM MASTER_COMPENSATION_BOX').then(([rows]) => rows),
    ]);

    const findId = (list, name) => {
        if (!name || name === '-' || name === 'null' || name === '') return null;
        const normalizedSearch = name.toString().toLowerCase().trim()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        const item = list.find(i => {
            if (!i.nombre) return false;
            const normalizedItem = i.nombre.toString().toLowerCase().trim()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return normalizedSearch.includes(normalizedItem) || normalizedItem.includes(normalizedSearch);
        });
        return item ? item.id : null;
    };

    for (const item of normalizedData) {
        processed++;
        const row = item.normalized;
        const original = item.original;

        const cedula = row.cedula || original['CEDULA'];
        if (!cedula) continue; 

        const emailVal = row.correo_electronico || original['CORREO ELECTRONICO'];

        // 2. Mapeo para la tabla PEOPLE
        const peopleFields = {
            document_number: String(cedula).trim(),
            first_name: row.apellidos_y_nombres ? String(row.apellidos_y_nombres).split(' ')[0] : 'Sin Nombre',
            last_name: row.apellidos_y_nombres ? String(row.apellidos_y_nombres).split(' ').slice(1).join(' ') : 'Sin Apellido',
            email: emailVal && String(emailVal).trim() !== '' ? String(emailVal).trim() : null,
            phone_number: row.telefono || original['TELEFONO'] ? String(row.telefono || original['TELEFONO']).trim() : null,
            birthdate: excelDateToJS(row.fecha_nacimiento || original['FECHA NACIMIENTO']),
            registration_date: excelDateToJS(row.fecha_de_ingreso || original['FECHA DE INGRESO']),
        };

        Object.keys(peopleFields).forEach(key => { if (peopleFields[key] === null) delete peopleFields[key]; });
        const pKeys = Object.keys(peopleFields);
        const pValues = Object.values(peopleFields);

        // 2. Mapeo exhaustivo para BASE_DATOS_MAESTRA (mantiene todo en bruto para la UI)
        const fullFields = {
            tipo_identificacion: original['Tipo de identificacion, EMPRESA'] || original['TIPO DE IDENTIFICACION, EMPRESA'] || row.tipo_de_identificacion_empresa || null,
            empresa: row.empresa || original['EMPRESA'] || null,
            cedula: cedula,
            apellidos_nombres: original['APELLIDOS Y NOMBRES'] || row.apellidos_y_nombres || null,
            cargo: row.cargo || original['CARGO'] || null,
            fecha_ingreso: original['FECHA DE INGRESO'] || row.fecha_de_ingreso || null,
            tipo_contrato: original['TIPO DE CONTRATO'] || row.tipo_de_contrato || null,
            ciudad: row.ciudad || original['CIUDAD'] || null,
            unidad_negocio: original['UNIDAD DE NEGOCIO'] || row.unidad_de_negocio || null,
            cliente: row.cliente || original['CLIENTE'] || null,
            ceco: row.ceco || original['CECO'] || null,
            oficina: row.oficina || original['OFICINA'] || null,
            fecha_vencimiento: original['FECHA VENCIMIENTO'] || row.fecha_vencimiento || null,
            sueldo_2026: original['SUELDO 2026'] || row.sueldo_2026 || null,
            auxilio_alimentacion: original['AUXILIO DE ALIMENTACION'] || row.auxilio_de_alimentacion || null,
            auxilio_adicional_transporte: original['AUXILIO ADICIONAL DE TRASPORT'] || row.auxilio_adicional_de_trasport || null,
            bonificacion: row.bonificacion || original['BONIFICACION'] || null,
            auxilio_rodamientos_1q: original['AUXILIO RODAMIENTO 1Q'] || row.auxilio_rodamientos_1q || null,
            auxilio_rodamientos_2q: original['AUXILIO RODAMIENTO 2Q'] || row.auxilio_rodamientos_2q || null,
            auxilio_trans_extralegal: original['AUXILIO TRAN EXTRALEGAL'] || row.auxilio_trans_extralegal || null,
            auxilio_conectividad: original['AXILIO CONECTIVIDAD'] || row.axilio_conectividad || null,
            autorizacion_tramite_datos: original['AUTORIZACION TRAMITE DE DATOS'] || row.autorizacion_tramite_de_datos || null,
            expedicion_documento: original['EXPEDICION DEL DOCUMENTO'] || row.expedicion_del_documento || null,
            genero: row.genero || original['GENERO'] || null,
            orientacion_sexual: original['ORIENTACION SEXUAL'] || row.orientacion_sexual || null,
            poblacion_especial: original['POBLACION ESPECIAL'] || row.poblacion_especial || null,
            grupo_etnico: original['GRUPO ETNICO'] || row.grupo_etnico || null,
            fecha_nacimiento: original['FECHA NACIMIENTO'] || row.fecha_nacimiento || null,
            estado_civil: original['ESTADO CIVIL'] || row.estado_civil || null,
            nombre_pareja: original['NOMBRE DE LA PAREJA'] || row.nombre_de_la_pareja || null,
            nro_pareja: original['N° DE LA PAREJA'] || row.n_de_la_pareja || null,
            rh: row.rh || original['RH'] || null,
            enfermedades: original['ENFERMEDADES'] || row.enfermedades || null,
            otras_enfermedades: original['OTRAS ENFERMEDADES'] || row.otras_enfermedades || null,
            ultimo_nivel_estudio: original['ULTIMO NIVEL DE ESTUDIO'] || row.ultimo_nivel_de_estudio || null,
            nombre_titulo: original['NOMBRE DEL TITULO'] || row.nombre_del_titulo || null,
            correo_electronico: emailVal || null,
            telefono: row.telefono || original['TELEFONO'] || null,
            nombre_contacto_emergencia: original['NOMBRE CONTACTO DE EMERGENCIA'] || row.nombre_contacto_de_emergencia || null,
            parentesco_contacto: original['PARENTESCO DEL CONTACTO'] || row.parentesco_del_contacto || null,
            cel_emergencia: original['CEL DE EMERGENCIA'] || row.cel_de_emergencia || null,
            tel_fijo_emergencia: original['TEL. FIJO DE EMERGENCIA'] || row.tel_fijo_de_emergencia || null,
            departamento: row.departamento || original['DEPARTAMENTO'] || null,
            ciudad_residencia: original['CIUDAD DE RESIDENCIA'] || row.ciudad_de_residencia || null,
            barrio: row.barrio || original['BARRIO'] || null,
            direccion: row.direccion || original['DIRECCION'] || null,
            estrato: row.estrato || original['ESTRATO'] || null,
            tipo_vivienda: original['TIPO DE VIVIENDA'] || row.tipo_de_vivienda || null,
            cuenta_vehiculo_propio: original['¿Cuenta con vehículo Propio?'] || original['CUENTA CON VEHICULO PROPIO'] || row.cuenta_con_vehiculo_propio || null,
            nro_hijos: original['N° DE HIJO'] || row.n_de_hijo || null,
            fn_h1: original['F.N. H 1'] || row.f_n_h_1 || null, nro_doc_h1: original['N° DOC. H 1'] || row.n_doc_h_1 || null,
            fn_h2: original['F.N. H 2'] || row.f_n_h_2 || null, nro_doc_h2: original['N° DOC. H 2'] || row.n_doc_h_2 || null,
            fn_h3: original['F.N. H 3'] || row.f_n_h_3 || null, nro_doc_h3: original['N° DOC. H 3'] || row.n_doc_h_3 || null,
            fn_h4: original['F.N. H 4'] || row.f_n_h_4 || null, nro_doc_h4: original['N° DOC. H 4'] || row.n_doc_h_4 || null,
            fn_h5: original['F.N. H 5'] || row.f_n_h_5 || null, nro_doc_h5: original['N° DOC. H 5'] || row.n_doc_h_5 || null,
            t_camisa: original['T. CAMISA'] || row.t_camisa || null,
            t_pantalon: original['T. PANTALON'] || row.t_pantalon || null,
            t_zapatos: original['T. ZAPATOS'] || row.t_zapatos || null,
            t_chaquetas: original['T. CHAQUETAS'] || row.t_chaquetas || null,
            t_chalecos: original['T. CHALECOS'] || row.t_chalecos || null,
            familiar_en_empresa: original['TIENE USTED ACTUALMENTE UN FAMILIAR QUE LABORE EN LA EMPRESA'] || row.tiene_usted_actualmente_un_familiar_que_labore_en_la_empresa || null,
            compania: original['COMPAÑIA'] || row.compania || null,
            parentesco: original['PARENTESCO'] || row.parentesco || null,
            hv_referida: original['Su Hoja de Vida ha sido referida por algún funcionario de la compañía o conoce a alguna persona que esté laborando actualmente en la misma empresa?'] || row.su_hoja_de_vida_ha_sido_referida || null,
            nombre_referido: original['si su respuesta es Si indique su nombre completo'] || row.si_su_respuesta_es_si_indique_su_nombre_completo || null,
            familiares_pep: original['Tiene familiares publicamente expuestos ?'] || row.tiene_familiares_publicamente_expuestos || null,
            porque_pep: original['Por que esta publicamente expuesto ?'] || row.por_que_esta_publicamente_expuesto || null,
            cargo_publico: original['Usted esta participando en algún cargo publico?'] || row.usted_esta_participando_en_algun_cargo_publico || null,
            salud: row.salud || original['SALUD'] || null,
            pension: row.pension || original['PENSION'] || null,
            caja: row.caja || original['CAJA'] || null,
            cuenta_bancaria: original['CUENTA BANCARIA'] || row.cuenta_bancaria || null,
            fecha_retiro: original['FECHA DE RETIRO'] || row.fecha_de_retiro || null,
            motivo_retiro: original['MOTIVO DE RETIRO'] || row.motivo_de_retiro || null,
            motivo_confidencial: original['MOTIVO CONFIDENCIAL'] || row.motivo_confidencial || null,
            estado: row.estado || original['ESTADO'] || null,
            lider: row.lider || original['LIDER'] || null,
            aplica_dotacion: original['APLICA PARA DOTACIÓN'] || row.aplica_para_dotacion || null,
        };

        const fKeys = Object.keys(fullFields);
        const fValues = Object.values(fullFields);

        try {
            // 1. Asegurar que existe en tabla PEOPLE y obtener people_id
            const [existingPeople] = await db.query('SELECT people_id FROM people WHERE document_number = ?', [peopleFields.document_number]);
            let peopleId;

            if (existingPeople.length > 0) {
                peopleId = existingPeople[0].people_id;
                // Actualizar info básica en PEOPLE
                const pKeys = Object.keys(peopleFields);
                const pValues = Object.values(peopleFields);
                const sqlPeople = `UPDATE people SET ${pKeys.map(k => `${k} = ?`).join(', ')} WHERE people_id = ?`;
                await db.query(sqlPeople, [...pValues, peopleId]);
            } else {
                // Insertar nuevo en PEOPLE
                const pKeys = Object.keys(peopleFields);
                const pValues = Object.values(peopleFields);
                const [pResult] = await db.query(`INSERT INTO people (${pKeys.join(', ')}) VALUES (${pKeys.map(() => '?').join(', ')})`, pValues);
                peopleId = pResult.insertId;
            }

            // 2. Insertar/Actualizar en people_extended_info
            fullFields.people_id = peopleId;
            const fKeys = Object.keys(fullFields);
            const fValues = Object.values(fullFields);

            const sqlExtended = `
                INSERT INTO people_extended_info (${fKeys.join(', ')})
                VALUES (${fKeys.map(() => '?').join(', ')})
                ON DUPLICATE KEY UPDATE
                ${fKeys.map(k => `${k} = IFNULL(VALUES(${k}), ${k})`).join(', ')}
            `;
            await db.query(sqlExtended, fValues);

            // 3. NUEVO: Sincronizar PEOPLE_HEALT_SECURITY
            const healthParams = {
                people_id: peopleId,
                eps_id: findId(epsList, row.salud || original['SALUD']),
                pension_id: findId(pensionList, row.pension || original['PENSION']),
                arl_id: findId(arlList, row.arl || original['ARL']),
                compensation_box_id: findId(ccfList, row.caja || original['CAJA']),
                bank_account: row.cuenta_bancaria || original['CUENTA BANCARIA']
            };

            const hKeys = Object.keys(healthParams).filter(k => healthParams[k] !== null);
            const hValues = hKeys.map(k => healthParams[k]);

            if (hKeys.length > 1) { // people_id + al menos uno más
                const sqlHealth = `
                    INSERT INTO PEOPLE_HEALT_SECURITY (${hKeys.join(', ')})
                    VALUES (${hKeys.map(() => '?').join(', ')})
                    ON DUPLICATE KEY UPDATE
                    ${hKeys.map(k => `${k} = IFNULL(VALUES(${k}), ${k})`).join(', ')}
                `;
                await db.query(sqlHealth, hValues);
            }

            // 4. NUEVO: Intentar actualizar BUSINESS_PEOPLE_DATA
            // Buscamos si el empleado tiene alguna orden previa para actualizar su salario/fecha ingreso
            const [existingBusiness] = await db.query(
                'SELECT order_id FROM HIRING_ORDER WHERE user_id = ? OR order_id IN (SELECT order_id FROM BUSINESS_PEOPLE_DATA WHERE start_date IS NOT NULL AND client_id IS NOT NULL) LIMIT 1',
                [peopleId]
            );

            if (existingBusiness.length > 0) {
                const orderId = existingBusiness[0].order_id;
                const businessParams = {
                    salary: row.sueldo_2026 || original['SUELDO 2026'],
                    start_date: excelDateToJS(row.fecha_ingreso || original['FECHA DE INGRESO']),
                    termination_date: excelDateToJS(row.fecha_retiro || original['FECHA DE RETIRO'])
                };

                const bKeys = Object.keys(businessParams).filter(k => businessParams[k] !== null);
                const bValues = bKeys.map(k => businessParams[k]);

                if (bKeys.length > 0) {
                    const sqlBusiness = `UPDATE BUSINESS_PEOPLE_DATA SET ${bKeys.map(k => `${k} = ?`).join(', ')} WHERE order_id = ?`;
                    await db.query(sqlBusiness, [...bValues, orderId]);
                }
            }
            
            inserted++;
        } catch (err) {
            console.error('Error insertando fila:', err);
            errors.push(`Cédula ${cedula}: ${err.message}`);
        }
    }

    if (inserted === 0 && processed > 0) {
        throw new Error('No se pudo insertar ningún registro. Verifica el formato de tu Excel (fechas, correos únicos). Errores: ' + errors.slice(0,3).join(' | '));
    }

    return { success: true, processed, inserted, errors };
};

module.exports = { process };
