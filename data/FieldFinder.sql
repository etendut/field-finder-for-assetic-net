
SET NOCOUNT OFF



--control view
IF OBJECT_ID('FieldDDMappings', 'V') IS NOT NULL
	DROP VIEW dbo.[FieldDDMappings] 
GO
CREATE VIEW [dbo].[FieldDDMappings]
AS
SELECT DISTINCT 
                         dbo.MrMigrationType.Label AS MigrationType, dbo.MrCategory.Name AS myDataCategoryName, dbo.MrFieldMappingMyData.MdpComponentRef, dbo.MrFieldMappingMyData.MdpLabelDescription, 
                         dbo.MrFieldMappingMyData.IsObsolete, dbo.MrFieldMappingMyData.ObsoleteReason, empty.dbo.configCACategory.Label AS CloudCategory, dbo.ApplicationControls.Label AS CloudLabel, 
                         CASE dbo.ApplicationControls.Type WHEN 'checkbox' THEN 'Checkbox' WHEN 'datePicker' THEN 'Date Picker' WHEN 'hyperLinkEdit' THEN 'Link' WHEN 'mdCombobox' THEN 'Combobox' WHEN 'numericTextbox'
                          THEN 'Numeric Stepper' WHEN 'resourceChooser' THEN 'Resource Chooser' WHEN 'textArea' THEN 'Mulitline Text' WHEN 'textbox' THEN 'Text' WHEN 'ValueUnit' THEN 'Measurement' ELSE dbo.ApplicationControls.Type
                          END AS cloudControlType, dbo.MrFieldMappingMyData.MdpDataType, dbo.ApplicationControls.DataType AS CloudDataType, CASE WHEN replace(dbo.ApplicationControls.DataType, '?', '') 
                         = replace(replace(replace(replace(dbo.MrFieldMappingMyData.MdpDataType, 'system.', ''), 'boolean', 'bool'), 'int32', 'int'), 'system.', '') THEN 0 ELSE 1 END AS DataTypeDifferent, 
                         dbo.ApplicationSections.Name AS cloudSection, dbo.ApplicationSections.Label AS cloudSectionLabel, dbo.ApplicationControlGroups.Name AS cloudControlGroup, 
                         dbo.ApplicationControlGroups.Label AS cloudControlGroupLabel, dbo.MrFieldMappingMyData.MyDataCategoryId, CASE WHEN dbo.ApplicationControls.Type = 'mdCombobox' OR
                         dbo.ApplicationControls.Id IN (71) THEN 100 WHEN dbo.ApplicationControls.Type = 'mdCombobox' OR
                         dbo.ApplicationControls.Id IN (72, 2402) THEN 200 WHEN dbo.ApplicationControls.Type = 'resourceChooser' THEN 50 ELSE sc.CHARACTER_MAXIMUM_LENGTH END AS CloudTextLength, 
                         dbo.ApplicationControls.Name AS CloudControlName, dbo.MrFieldMappingMyData.MdpIsCalculation, dbo.MrFieldMappingMyData.MdpCalculation, dbo.MrFieldMappingMyData.MdpGroupLabelDescription, 
                         dbo.ApplicationSubModules.Name AS cloudsubModule, dbo.ApplicationSubModules.Label AS cloudsubModuleLabel, dbo.ApplicationControls.HelpString AS cloudHelpstring, 
                         CASE ResourceType WHEN 8 THEN 'Contractor' WHEN 27 THEN 'User,Team,Contractor,Employee' WHEN 32 THEN 'Company' WHEN 40 THEN 'Contractor,Company' ELSE CAST(ResourceType AS nvarchar(100)) 
                         END AS cloudResourceType, dbo.ApplicationCategories.Name AS cloudTemplate, dbo.ApplicationCategories.Id AS templateID, empty.dbo.configCACategory.Id AS categoryID
FROM            dbo.MrCategory INNER JOIN
                         dbo.MrFieldMappingMyData ON dbo.MrCategory.Id = dbo.MrFieldMappingMyData.MyDataCategoryId INNER JOIN
                         dbo.MrMigrationType ON dbo.MrFieldMappingMyData.MyDataMigrationTypeId = dbo.MrMigrationType.Id RIGHT OUTER JOIN
                         empty.INFORMATION_SCHEMA.COLUMNS AS sc RIGHT OUTER JOIN
                         dbo.ApplicationControlConstraints RIGHT OUTER JOIN
                         dbo.ApplicationSections INNER JOIN
                         dbo.ApplicationSectCtrlGp ON dbo.ApplicationSections.Id = dbo.ApplicationSectCtrlGp.SectionID INNER JOIN
                         dbo.ApplicationSubModules ON dbo.ApplicationSections.SubModuleId = dbo.ApplicationSubModules.Id INNER JOIN
                         dbo.ApplicationControlGroups INNER JOIN
                         dbo.ApplicationControls ON dbo.ApplicationControlGroups.Id = dbo.ApplicationControls.ApplicationControlGroupId ON dbo.ApplicationSectCtrlGp.ControlGroupID = dbo.ApplicationControlGroups.Id INNER JOIN
                         dbo.ApplicationCategories ON dbo.ApplicationSubModules.CategoryId = dbo.ApplicationCategories.Id INNER JOIN
                         empty.dbo.configCACategoryTemplate INNER JOIN
                         empty.dbo.configCACategory ON empty.dbo.configCACategoryTemplate.Id = empty.dbo.configCACategory.CategoryTemplateValue ON 
                         dbo.ApplicationCategories.Name COLLATE Latin1_General_CI_AS = empty.dbo.configCACategoryTemplate.Name ON dbo.ApplicationControlConstraints.ApplicationControlId = dbo.ApplicationControls.Id ON 
                         sc.TABLE_NAME COLLATE SQL_Latin1_General_CP1_CI_AS = 'CAGR' + dbo.ApplicationControlGroups.Name AND sc.COLUMN_NAME COLLATE SQL_Latin1_General_CP1_CI_AS = dbo.ApplicationControls.Name ON
                          dbo.MrFieldMappingMyData.ApplicationControlID = dbo.ApplicationControls.Id

GO


 IF OBJECT_ID('tempdb.dbo.#cloudCat', 'U') IS NOT NULL
	DROP TABLE #cloudCat; 
IF OBJECT_ID('tempdb.dbo.#cloudTemp', 'U') IS NOT NULL
	DROP TABLE #cloudTemp; 
IF OBJECT_ID('tempdb.dbo.#cloudFields', 'U') IS NOT NULL
	DROP TABLE #cloudFields; 
IF OBJECT_ID('tempdb.dbo.#cloudDashboardFields', 'U') IS NOT NULL
	DROP TABLE #cloudDashboardFields; 

--common fields
select A.* into #cloudDashboardFields  from (
 values
 ('Asset - Attributes','Asset ID','Unique Identifier for the Asset','textBox',CAST(null AS NVARCHAR(100)),'CAAssetDashboard','CAAttributes')
 ,('Asset - Attributes','Asset Name','Common name for the Asset','textBox',null,'CAAssetDashboard','CAAttributes')
 ,('Asset - Attributes','External ID','External system identifier','textBox',null,'CAAssetDashboard','CAAttributes')
 ,('Asset - Core Fields','Asset Class','Classification of the Asset','Cascading Dropdown',null,'CAAssetDashboard','CAAttributes')
 ,('Asset - Core Fields','Asset Sub Class','Classification of the Asset','Cascading Dropdown',null,'CAAssetDashboard','CAAttributes')
 ,('Asset - Core Fields','Asset Type','Type of the Asset','Cascading Dropdown',null,'CAAssetDashboard','CAAttributes')
 ,('Asset - Core Fields','Asset Sub Type','Type of the Asset','Cascading Dropdown',null,'CAAssetDashboard','CAAttributes')
 ,('Asset - Core Fields','Criticality','Criticality of the Asset','Dropdown',null,'CAAssetDashboard','CAAttributes')
 ,('Maintenance Asset - Core Fields','Maintenance Asset Type','Type of the Asset for Maintenance purposes','Cascading Dropdown',null,'CAAssetDashboard','CAAttributes')
 ,('Maintenance Asset - Core Fields','Maintenance Asset Sub Type','Type of the Asset for Maintenance purposes','Cascading Dropdown',null,'CAAssetDashboard','CAAttributes')
 ,('Maintenance Asset - Core Fields','Maintenance Work Group','Working Zone the asset falls under','Dropdown',null,'CAAssetDashboard','CAAttributes')
 ,('Location','Asset Location','Map location of asset','Map Editor',null,'CAAssetDashboard','CAAttributes')
 ) 
 a (cloudControlGroupLabel , CloudLabel ,cloudHelpstring  ,cloudControlType , cloudResourceType ,cloudsection,cloudsubmodule)


CREATE TABLE #cloudFields (
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[cloudControlGroupLabel] [nvarchar](50) NULL,
	[CloudLabel] [nvarchar](50) NULL,
	[cloudHelpstring] [nvarchar](600) NULL,
	[cloudControlType] [nvarchar](50) NULL,
	[cloudResourceType] [nvarchar](100) NULL,
	[cloudsection] [nvarchar](max) NULL,
	[cloudsubmodule] [nvarchar](max) NULL,
 CONSTRAINT [PK_cloudFields] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]


SELECT distinct cloudlabel, categoryID
into #cloudCat  
FROM (SELECT distinct cloudlabel , categoryID
from dbo.FieldDDMappings 
where categoryID is not null and CloudLabel not in (select CloudLabel from #cloudDashboardFields) --and cloudlabel = 'Sign Type'
UNION ALL
SELECT distinct CloudLabel, C.categoryID from #cloudDashboardFields
CROSS JOIN (SELECT distinct categoryID from dbo.FieldDDMappings where categoryID is not null) C) S (cloudlabel, categoryID)
ORDER BY cloudlabel , categoryID

CREATE CLUSTERED INDEX IDX_C_cloudlabel_cloudcategory ON #cloudCat(cloudlabel, categoryID)

SELECT distinct cloudlabel, CAST(templateID AS NVARCHAR(100)) templateID  into #cloudTemp  from 
(SELECT distinct cloudlabel, templateID FROM dbo.FieldDDMappings 
where templateID is not null and CloudLabel not in (select CloudLabel from #cloudDashboardFields) --and cloudlabel = 'Sign Type'
UNION ALL
SELECT distinct CloudLabel,C.templateID from #cloudDashboardFields
CROSS JOIN (SELECT distinct templateID from dbo.FieldDDMappings where templateID is not null) C) S (cloudlabel, templateID)
ORDER BY cloudlabel , templateID

CREATE CLUSTERED INDEX IDX_C_cloudlabel_cloudTemplate ON #cloudTemp(cloudlabel, templateID)

INSERT INTO #cloudFields
           ([cloudControlGroupLabel]
           ,[CloudLabel]
           ,[cloudHelpstring]
           ,[cloudControlType]
           ,[cloudResourceType]
           ,[cloudsection]
           ,[cloudsubmodule])
SELECT distinct cloudControlGroupLabel , CloudLabel ,cloudHelpstring  ,cloudControlType , cloudResourceType ,cloudsection,cloudsubmodule from FieldDDMappings 
where cloudsection is not null and CloudLabel not in (select CloudLabel from #cloudDashboardFields) --and cloudlabel = 'Sign Type'
UNION ALL
SELECT distinct cloudControlGroupLabel , CloudLabel ,cloudHelpstring  ,cloudControlType , cloudResourceType ,cloudsection,cloudsubmodule from #cloudDashboardFields
ORDER BY CloudLabel
	

PRINT '--TEMP TABLES SEEDED--'
SELECT [processing-instruction(x)]=(
select replace(replace(replace(
(SELECT cloudControlGroupLabel [group], CloudLabel label,cloudHelpstring help ,cloudControlType [type], cloudResourceType resourceTypes
				--(select distinct MdpLabelDescription from dbo.FieldDDMappings s where s.CloudLabel = fm.cloudlabel AND MdpLabelDescription IS NOT NULL for json path) as mdpLabels
				--,(select distinct cloudcategory  from #cloudCat s where s.CloudLabel = fm.cloudlabel AND cloudcategory IS NOT NULL FOR JSON PATH)  as categories
				--,(select distinct cloudTemplate  from #cloudTemp s where s.CloudLabel = fm.cloudlabel AND cloudTemplate IS NOT NULL for json PATH) as categoryTemplates
				,(SELECT REPLACE( REPLACE( (SELECT DISTINCT MdpLabelDescription from dbo.FieldDDMappings s where s.CloudLabel = fm.cloudlabel AND MdpLabelDescription IS NOT NULL FOR JSON AUTO),'{"MdpLabelDescription":','' ),'"}','"' )) as mdpLabels
				,(SELECT REPLACE( REPLACE( (SELECT DISTINCT categoryID from #cloudCat s where s.CloudLabel = fm.cloudlabel COLLATE SQL_Latin1_General_CP1_CI_AS AND categoryID IS NOT NULL FOR JSON AUTO),'{"categoryID":','' ),'"}','"' )) as categories
				--,(SELECT REPLACE( REPLACE( (SELECT DISTINCT cloudcategory from #cloudCat s where s.CloudLabel = fm.cloudlabel COLLATE SQL_Latin1_General_CP1_CI_AS AND cloudcategory IS NOT NULL FOR JSON AUTO),'{"cloudcategory":','' ),'"}','"' )) as categories
				,(SELECT REPLACE( REPLACE( (SELECT DISTINCT templateID from #cloudTemp s where s.CloudLabel = fm.cloudlabel AND templateID IS NOT NULL FOR JSON AUTO),'{"templateID":','' ),'"}','"' )) as categoryTemplates
				--,(SELECT REPLACE( REPLACE( (SELECT DISTINCT cloudTemplate from #cloudTemp s where s.CloudLabel = fm.cloudlabel AND cloudTemplate IS NOT NULL FOR JSON AUTO),'{"cloudTemplate":','' ),'"}','"' )) as categoryTemplates
				,CASE WHEN isnull(cloudsection, '') = '' THEN '' ELSE '/a/Auto/' + cloudsubmodule + '/' + cloudsection + '/' END AS link

FROM     #cloudFields fm 

for json path, root ('DataDictionary')),'\"','"'),'"[','['),']"',']')
) FOR XML PATH(''),TYPE;
			

DROP TABLE #cloudCat
DROP TABLE #cloudTemp
DROP TABLE #cloudFields
DROP TABLE #cloudDashboardFields

SET NOCOUNT OFF



select DISTINCT ca.Label categoryLabel,ac.Name templateName,ac.id templateID from ApplicationCategories ac 
	inner join empty..configCACategoryTemplate ct on ct.Name COLLATE SQL_Latin1_General_CP1_CI_AS= ac.Name
	inner join empty..configCACategory ca on ca.CategoryTemplateValue = ct.id
	FOR JSON PATH, root('categories')

