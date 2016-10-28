
SET NOCOUNT OFF


 IF OBJECT_ID('tempdb.dbo.#cloudCat', 'U') IS NOT NULL
	DROP TABLE #cloudCat; 
IF OBJECT_ID('tempdb.dbo.#cloudTemp', 'U') IS NOT NULL
	DROP TABLE #cloudTemp; 
IF OBJECT_ID('tempdb.dbo.#cloudFields', 'U') IS NOT NULL
	DROP TABLE #cloudFields; 
IF OBJECT_ID('tempdb.dbo.#cloudDashboardFields', 'U') IS NOT NULL
	DROP TABLE #cloudDashboardFields; 


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


SELECT distinct cloudlabel, cloudcategory
into #cloudCat  
FROM (SELECT distinct cloudlabel , cloudcategory
from dbo.FieldMappings 
where cloudcategory is not null and CloudLabel not in (select CloudLabel from #cloudDashboardFields) --and cloudlabel = 'Sign Type'
UNION ALL
SELECT distinct CloudLabel, C.CloudCategory from #cloudDashboardFields
CROSS JOIN (SELECT distinct cloudcategory from dbo.FieldMappings where cloudcategory is not null) C) S (cloudlabel, cloudcategory)
ORDER BY cloudlabel , cloudcategory

CREATE CLUSTERED INDEX IDX_C_cloudlabel_cloudcategory ON #cloudCat(cloudlabel, cloudcategory)

SELECT distinct cloudlabel, CAST(cloudTemplate AS NVARCHAR(100)) cloudTemplate  into #cloudTemp  from 
(SELECT distinct cloudlabel, cloudTemplate FROM dbo.FieldMappings 
where cloudTemplate is not null and CloudLabel not in (select CloudLabel from #cloudDashboardFields) --and cloudlabel = 'Sign Type'
UNION ALL
SELECT distinct CloudLabel,C.cloudTemplate from #cloudDashboardFields
CROSS JOIN (SELECT distinct cloudTemplate from dbo.FieldMappings where cloudTemplate is not null) C) S (cloudlabel, cloudTemplate)
ORDER BY cloudlabel , cloudTemplate

CREATE CLUSTERED INDEX IDX_C_cloudlabel_cloudTemplate ON #cloudTemp(cloudlabel, cloudTemplate)

INSERT INTO #cloudFields
           ([cloudControlGroupLabel]
           ,[CloudLabel]
           ,[cloudHelpstring]
           ,[cloudControlType]
           ,[cloudResourceType]
           ,[cloudsection]
           ,[cloudsubmodule])
SELECT distinct cloudControlGroupLabel , CloudLabel ,cloudHelpstring  ,cloudControlType , cloudResourceType ,cloudsection,cloudsubmodule from FieldMappings 
where cloudsection is not null and CloudLabel not in (select CloudLabel from #cloudDashboardFields) --and cloudlabel = 'Sign Type'
UNION ALL
SELECT distinct cloudControlGroupLabel , CloudLabel ,cloudHelpstring  ,cloudControlType , cloudResourceType ,cloudsection,cloudsubmodule from #cloudDashboardFields
ORDER BY CloudLabel
	

PRINT '--TEMP TABLES SEEDED--'
SELECT [processing-instruction(x)]=(
select replace(replace(replace(
(SELECT cloudControlGroupLabel [group], CloudLabel label,cloudHelpstring help ,cloudControlType [type], cloudResourceType resourceTypes
				--(select distinct MdpLabelDescription from dbo.FieldMappings s where s.CloudLabel = fm.cloudlabel AND MdpLabelDescription IS NOT NULL for json path) as mdpLabels
				--,(select distinct cloudcategory  from #cloudCat s where s.CloudLabel = fm.cloudlabel AND cloudcategory IS NOT NULL FOR JSON PATH)  as categories
				--,(select distinct cloudTemplate  from #cloudTemp s where s.CloudLabel = fm.cloudlabel AND cloudTemplate IS NOT NULL for json PATH) as categoryTemplates
				,(SELECT REPLACE( REPLACE( (SELECT DISTINCT MdpLabelDescription from dbo.FieldMappings s where s.CloudLabel = fm.cloudlabel AND MdpLabelDescription IS NOT NULL FOR JSON AUTO),'{"MdpLabelDescription":','' ),'"}','"' )) as mdpLabels
				,(SELECT REPLACE( REPLACE( (SELECT DISTINCT cloudcategory from #cloudCat s where s.CloudLabel = fm.cloudlabel COLLATE SQL_Latin1_General_CP1_CI_AS AND cloudcategory IS NOT NULL FOR JSON AUTO),'{"cloudcategory":','' ),'"}','"' )) as categories
				,(SELECT REPLACE( REPLACE( (SELECT DISTINCT cloudTemplate from #cloudTemp s where s.CloudLabel = fm.cloudlabel AND cloudTemplate IS NOT NULL FOR JSON AUTO),'{"cloudTemplate":','' ),'"}','"' )) as categoryTemplates
				,CASE WHEN isnull(cloudsection, '') = '' THEN '' ELSE '/a/Auto/' + cloudsubmodule + '/' + cloudsection + '/' END AS link

FROM     #cloudFields fm 

for json path, root ('DataDictionary')),'\"','"'),'"[','['),']"',']')
) FOR XML PATH(''),TYPE;
			

DROP TABLE #cloudCat
DROP TABLE #cloudTemp
DROP TABLE #cloudFields
DROP TABLE #cloudDashboardFields

SET NOCOUNT OFF

