const db = require('../../../config/db');

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

    for (const item of normalizedData) {
        processed++;
        const row = item.normalized;
        const original = item.original;

        // Try to find the exact column names from the raw data if the normalized one fails,
        // or map based on expected columns.
        const cedula = row.cedula || original['CEDULA'];
        if (!cedula) continue; // Skip if no cedula

        // Helper for excel dates
        const parseDate = (val) => {
            if (!val) return null;
            if (typeof val === 'number') {
                // Excel date serial
                return new Date(Math.round((val - 25569) * 86400 * 1000)).toISOString().slice(0, 10);
            }
            if (typeof val === 'string') {
                // assume DD/MM/YYYY
                const parts = val.split('/');
                if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
                return null; // fallback
            }
            return null;
        };

        const emailVal = row.correo_electronico || original['CORREO ELECTRONICO'];

        // 1. Mapeo para la tabla PEOPLE
        const peopleFields = {
            document_number: String(cedula).trim(),
            first_name: row.apellidos_y_nombres ? String(row.apellidos_y_nombres).split(' ')[0] : 'Sin Nombre',
            last_name: row.apellidos_y_nombres ? String(row.apellidos_y_nombres).split(' ').slice(1).join(' ') : 'Sin Apellido',
            email: emailVal && String(emailVal).trim() !== '' ? String(emailVal).trim() : null,
            phone_number: row.telefono || original['TELEFONO'] ? String(row.telefono || original['TELEFONO']).trim() : null,
            birthdate: parseDate(row.fecha_nacimiento || original['FECHA NACIMIENTO']),
            registration_date: parseDate(row.fecha_de_ingreso || original['FECHA DE INGRESO']),
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
            // Insertar en tabla transaccional (People)
            if (pKeys.length > 0) {
                const sqlPeople = `
                    INSERT INTO people (${pKeys.join(', ')})
                    VALUES (${pKeys.map(() => '?').join(', ')})
                    ON DUPLICATE KEY UPDATE
                    ${pKeys.map(k => `${k} = VALUES(${k})`).join(', ')}
                `;
                await db.query(sqlPeople, pValues);
            }

            // Insertar en Base de Datos Maestra para UI y analistas
            const sqlBase = `
                INSERT INTO base_datos_maestra (${fKeys.join(', ')})
                VALUES (${fKeys.map(() => '?').join(', ')})
                ON DUPLICATE KEY UPDATE
                ${fKeys.map(k => `${k} = VALUES(${k})`).join(', ')}
            `;
            await db.query(sqlBase, fValues);
            
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
