import { useState } from 'react';
import { Box, Paper, Tabs, Tab, Grid } from '@mui/material';
import { PropertyGroup, PropertyItem, FieldWrapper } from './UI/PropertyKit';
import { styles } from '../PublicElementPage.styles';

// Компонент панели табов
function TabPanel({ children, value, index }: { children?: React.ReactNode; index: number; value: number; }) {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && <Box sx={{ py: 3, px: {xs: 0, md: 2} }}>{children}</Box>}
        </div>
    );
}

export const ElementTabs = ({ data }: { data: any }) => {
    const [tab, setTab] = useState(0);

    // Данные секций
    const s1 = data.sec1_identification || {};
    const s2 = data.sec2_physical || {};
    const s3 = data.sec3_sanpin || {};
    const s5 = data.sec5_acute || {};
    const s6 = data.sec6_risks || {};
    const s8 = data.sec8_ecotox || {};
    const s9 = data.sec9_soil || {};
    const s11 = data.sec11_class || {};
    const s13 = data.sec13_label || {};
    const s14 = data.sec14_safety || {};
    const s15 = data.sec15_storage || {};
    const s18 = data.sec18_intl || {};
    const s20 = data.sec20_docs || {};
    const s21 = data.sec21_companies || {};
    const s22 = data.sec22_volumes || {};
    const s23 = data.sec23_extra || {};

    return (
        <Paper sx={styles.tabsPaper}>
            <Tabs
                value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
                sx={styles.tabsList}
            >
                <Tab label="1. Общие сведения" />
                <Tab label="2. Опасность" />
                <Tab label="3. Экология" />
                <Tab label="4. Классификация" />
                <Tab label="5. Безопасность" />
                <Tab label="6. Дополнительно" />
            </Tabs>

            {/* TAB 1: ИДЕНТИФИКАЦИЯ И ФИЗИКА */}
            <TabPanel value={tab} index={0}>
                <Grid container spacing={3}>
                    {/* Левая колонка: Идентификация (Широкая) */}
                    <Grid item xs={12} md={8}>
                        <PropertyGroup title="Идентификация вещества">
                            <FieldWrapper xs={12}><PropertyItem label="Название вещества (RU)" value={data.primary_name_ru} /></FieldWrapper>
                            <FieldWrapper md={4}><PropertyItem label="CAS Номер" value={data.cas_number} /></FieldWrapper>
                            <FieldWrapper md={4}><PropertyItem label="EC Номер" value={s1.ec_number} /></FieldWrapper>
                            <FieldWrapper md={4}><PropertyItem label="Код ТН ВЭД" value={s1.tnved_code} /></FieldWrapper>

                            <FieldWrapper xs={12}><PropertyItem label="Синонимы" value={s1.synonyms} /></FieldWrapper>
                            <FieldWrapper xs={12} md={6}><PropertyItem label="IUPAC (EN)" value={s1.iupac_name_en} /></FieldWrapper>
                            <FieldWrapper xs={12} md={6}><PropertyItem label="IUPAC (RU)" value={s1.iupac_name_ru} /></FieldWrapper>
                            <FieldWrapper xs={12}><PropertyItem label="Химическая формула" value={s1.molecular_formula} /></FieldWrapper>
                        </PropertyGroup>
                    </Grid>

                    {/* Правая колонка: Физика (Узкая) */}
                    <Grid item xs={12} md={4}>
                        <PropertyGroup title="Физико-химические свойства">
                            <FieldWrapper xs={6} md={12}><PropertyItem label="Агрегатное состояние" value={s2.appearance} /></FieldWrapper>
                            <FieldWrapper xs={6} md={12}><PropertyItem label="Внешний вид / Цвет" value={s2.color} /></FieldWrapper>
                            <FieldWrapper xs={6} md={12}><PropertyItem label="Запах" value={s2.odor} /></FieldWrapper>
                            <FieldWrapper xs={6} md={6}><PropertyItem label="Т. плавления" value={s2.melting_point} /></FieldWrapper>
                            <FieldWrapper xs={6} md={6}><PropertyItem label="Т. кипения" value={s2.boiling_point} /></FieldWrapper>
                            <FieldWrapper xs={6} md={6}><PropertyItem label="Плотность" value={s2.density} /></FieldWrapper>
                            <FieldWrapper xs={6} md={6}><PropertyItem label="pH" value={s2.ph} /></FieldWrapper>
                            <FieldWrapper xs={12}><PropertyItem label="Растворимость в воде" value={s2.solubility_water} /></FieldWrapper>
                        </PropertyGroup>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* TAB 2: ТОКСИКОЛОГИЯ */}
            <TabPanel value={tab} index={1}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <PropertyGroup title="Показатели токсичности (СанПиН)">
                            {/* Плотная сетка по 4 элемента в ряд */}
                            <FieldWrapper md={3}><PropertyItem label="Класс опасности" value={s3.hazard_class} /></FieldWrapper>
                            <FieldWrapper md={3}><PropertyItem label="КВИО" value={s3.kvio} /></FieldWrapper>
                            <FieldWrapper md={3}><PropertyItem label="ПДК Раб.зоны" value={s3.pdk_workzone} /></FieldWrapper>
                            <FieldWrapper md={3}><PropertyItem label="Состояние в воздухе" value={s3.state_in_air} /></FieldWrapper>
                            <FieldWrapper md={3}><PropertyItem label="ЛД50 Желудок" value={s3.ld50_stomach} /></FieldWrapper>
                            <FieldWrapper md={3}><PropertyItem label="ЛД50 Кожа" value={s3.ld50_skin} /></FieldWrapper>
                            <FieldWrapper md={3}><PropertyItem label="ЛК50 Воздух" value={s3.lc50_air} /></FieldWrapper>
                            <FieldWrapper md={3}><PropertyItem label="Зона острого действия" value={s3.zone_acute} /></FieldWrapper>
                        </PropertyGroup>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <PropertyGroup title="Воздействие на здоровье (СГС)">
                            <FieldWrapper xs={12}><PropertyItem label="Разъедание / раздражение кожи" value={s6.skin_corr} /></FieldWrapper>
                            <FieldWrapper xs={12}><PropertyItem label="Повреждение глаз" value={s6.eye_dmg} /></FieldWrapper>
                            <FieldWrapper xs={12}><PropertyItem label="Сенсибилизация" value={s6.sensitization} /></FieldWrapper>
                        </PropertyGroup>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <PropertyGroup title="Специфические эффекты">
                            <FieldWrapper xs={12}><PropertyItem label="Канцерогенность" value={s6.carcinogenicity} /></FieldWrapper>
                            <FieldWrapper xs={12}><PropertyItem label="Мутагенность" value={s6.mutagenicity} /></FieldWrapper>
                            <FieldWrapper xs={12}><PropertyItem label="Репродуктивная токсичность" value={s6.repro_tox} /></FieldWrapper>
                        </PropertyGroup>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* TAB 3: ЭКОЛОГИЯ */}
            <TabPanel value={tab} index={2}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <PropertyGroup title="Экотоксичность">
                            <FieldWrapper md={6}><PropertyItem label="ЛД50 Млекопитающие" value={s8.ld50_mammals} /></FieldWrapper>
                            <FieldWrapper md={6}><PropertyItem label="ЛД50 Птицы" value={s8.ld50_birds} /></FieldWrapper>
                            <FieldWrapper md={6}><PropertyItem label="ЛД50 Рыбы" value={s8.ld50_fish} /></FieldWrapper>
                            <FieldWrapper md={6}><PropertyItem label="ЛД50 Пчелы" value={s8.ld50_bees} /></FieldWrapper>
                            <FieldWrapper md={6}><PropertyItem label="Биоаккумуляция" value={s8.bioaccumulation} isBool /></FieldWrapper>
                            <FieldWrapper md={6}><PropertyItem label="Фитотоксичность" value={s8.phytotoxicity} isBool /></FieldWrapper>
                        </PropertyGroup>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <PropertyGroup title="Поведение в окружающей среде">
                            <FieldWrapper md={6}><PropertyItem label="ПДК в Почве" value={s9.pdk_soil} /></FieldWrapper>
                            <FieldWrapper md={6}><PropertyItem label="ОДК в Почве" value={s9.odk_soil} /></FieldWrapper>
                            <FieldWrapper md={6}><PropertyItem label="Персистентность" value={s9.persistence} /></FieldWrapper>
                            <FieldWrapper md={6}><PropertyItem label="Миграция" value={s9.migration} /></FieldWrapper>
                        </PropertyGroup>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* TAB 4: КЛАССИФИКАЦИЯ */}
            <TabPanel value={tab} index={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <PropertyGroup title="Классы опасности по стандартам">
                            <Grid container spacing={2}>
                                <FieldWrapper md={4}><PropertyItem label="СанПиН 0294-11" value={s11.sanpin_class} /></FieldWrapper>
                                <FieldWrapper md={4}><PropertyItem label="ГОСТ 12.1.007" value={s11.gost_body_class} /></FieldWrapper>
                                <FieldWrapper md={4}><PropertyItem label="ГОСТ 32424" value={s11.gost_env_class} /></FieldWrapper>
                            </Grid>
                        </PropertyGroup>
                    </Grid>

                    <Grid item xs={12}>
                        <PropertyGroup title="Маркировка GHS (СГС)">
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={3}>
                                    <PropertyItem label="Сигнальное слово" value={s13.signal_word} />
                                    <PropertyItem label="Пиктограммы" value={s13.pictogram_code} />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <PropertyItem label="H-фразы (Характеристика опасности)" value={s13.h_phrases} />
                                </Grid>
                                <Grid item xs={12} md={5}>
                                    <PropertyItem label="P-фразы (Меры предосторожности)" value={s13.p_phrases} />
                                </Grid>
                            </Grid>
                        </PropertyGroup>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* TAB 5: БЕЗОПАСНОСТЬ */}
            <TabPanel value={tab} index={4}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <PropertyGroup title="Меры первой помощи">
                            <PropertyItem label="Действия при отравлении" value={s14.first_aid} />
                        </PropertyGroup>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <PropertyGroup title="Средства индивидуальной защиты (СИЗ)">
                            <PropertyItem label="Рекомендации по СИЗ" value={s14.prevent_health} />
                        </PropertyGroup>
                    </Grid>
                    <Grid item xs={12}>
                        <PropertyGroup title="Хранение и обращение">
                            <Grid container spacing={2}>
                                <FieldWrapper md={3}><PropertyItem label="Температура" value={s15.temp_conditions} /></FieldWrapper>
                                <FieldWrapper md={3}><PropertyItem label="Влажность" value={s15.humidity} /></FieldWrapper>
                                <FieldWrapper md={3}><PropertyItem label="Срок хранения" value={s15.shelf_life} /></FieldWrapper>
                                <FieldWrapper xs={12}><PropertyItem label="Условия хранения" value={s15.storage_reqs} /></FieldWrapper>
                                <FieldWrapper xs={12}><PropertyItem label="Несовместимые вещества" value={s15.incompatible} /></FieldWrapper>
                            </Grid>
                        </PropertyGroup>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* TAB 6: ДОПОЛНИТЕЛЬНО */}
            <TabPanel value={tab} index={5}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <PropertyGroup title="Международное регулирование">
                            <Grid container spacing={2}>
                                <FieldWrapper md={6}><PropertyItem label="Озоноразрушающее (Монреаль)" value={s18.ozone_destroying} isBool /></FieldWrapper>
                                <FieldWrapper md={6}><PropertyItem label="Стокгольмская конвенция (СОЗ)" value={s18.pops} isBool /></FieldWrapper>
                                <FieldWrapper md={6}><PropertyItem label="Роттердамская конвенция (PIC)" value={s18.pic} isBool /></FieldWrapper>
                                <FieldWrapper md={6}><PropertyItem label="Минаматская конвенция (Ртуть)" value={s18.mercury} isBool /></FieldWrapper>
                            </Grid>
                        </PropertyGroup>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <PropertyGroup title="Оборот продукции">
                            <FieldWrapper xs={6}><PropertyItem label="Объем производства" value={s22.vol_production} /></FieldWrapper>
                            <FieldWrapper xs={6}><PropertyItem label="Объем импорта" value={s22.vol_import} /></FieldWrapper>
                            <FieldWrapper xs={12}><PropertyItem label="Участники цепи поставок" value={s21.info} /></FieldWrapper>
                        </PropertyGroup>
                    </Grid>
                    <Grid item xs={12}>
                        <PropertyGroup title="Нормативная документация">
                            <PropertyItem label="ГОСТы и Стандарты" value={s20.gost_standards} />
                            <PropertyItem label="Международные регламенты" value={s20.intl_docs} />
                        </PropertyGroup>
                    </Grid>
                </Grid>
            </TabPanel>
        </Paper>
    );
};