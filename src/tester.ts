import { Utils } from "./core/utils"
import * as path from 'node:path'

const cookie = `_ga=GA1.1.730408176.1742973438; ASP.NET_SessionId=snq32d4dod1qsqqxatqtnlpb; UTCPin=1497948; _ga_QZPGXDB5HS=GS1.1.1742975816.2.1.1742975906.55.0.0; .ASPXAUTH=92E2953EAD1D8170490213141FEB540F176CF2D6BEE8E3DC017DBDBCF85B99B54D10B6E988599D808A4490D7EEF8A88C2C367323F10E384C123ABCACD7266CFB7E30CEBBFB833691245D3961E2F08AABC7447BB31918E4640605BAB8ABD6CE920D4A1ECA; _ga_R8Z8J0M9FT=GS1.1.1743005008.4.1.1743005009.0.0.0`

export class Tester {

    eddyPost(url: string, body: any): Promise<any> {
        return new Promise(async(resolve, reject) => {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Accept': '*/*',
                        'Accept-Encoding': 'gzip, defalte, br, zstd',
                        'Accept-Language': 'en-US;en;q=0.9',
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'application/json',
                        'Cookie': cookie,
                        'Origin': 'https://myeddie.edwardsfiresafety.com',
                        'Pragma': 'no-cache',
                        'Priority': 'u=1, i',
                        'Referer': 'https://myeddie.edwardsfiresafety.com/Home/Index',
                        'Sec-Ch-Ua': 'Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': 'Windows',
                        'sec-fetch-dest': 'empty',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-site': 'same-origin',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify(body)
                })
                if (response.status >= 300) {
                    throw new Error(response.statusText)
                }
                const result = await response.json()
                return resolve(result)
            } catch (err) {
                console.error(err)
                return reject(err)
            }
        })        
    }

    getRootProductCategories(): Promise<ProductCategoryResponse> {
        return this.eddyPost('https://myeddie.edwardsfiresafety.com/Products/GetProductCategories', {categoryID: -1})
    }

    getProductCategories(categoryId: number): Promise<ProductCategoryResponse> {
        return this.eddyPost('https://myeddie.edwardsfiresafety.com/Products/GetProductCategories', {categoryID: categoryId})
    }

    getProductsByCategory(categoryId: number): Promise<ProductsByCategoryResponse> {
        return this.eddyPost('https://myeddie.edwardsfiresafety.com/Products/GetProductsByCategory', {categoryID: categoryId})
    }

    getProductMedia(productId: number): Promise<ProductMediaResponse> {
        return this.eddyPost('https://myeddie.edwardsfiresafety.com/Products/GetProductMedia', {productID: productId})
    }

    getProductFeatures(productId: number): Promise<ProductFeatureResponse> {
        return this.eddyPost('https://myeddie.edwardsfiresafety.com/Products/GetProductFeatures', {productID: productId})
    }

    doImport() {
        return new Promise(async(resolve, reject) => {
            try {

                let created = 0
                const ts = new Date()
                await Utils.ensureSubdirectoryExists(process.cwd(), 'eddyResponse')
                const rootCategoryResponse = await this.getRootProductCategories()
                if (rootCategoryResponse && rootCategoryResponse.ProductCategories && rootCategoryResponse.ProductCategories.length > 0) {
                    await this.sleep(Utils.getRandomIntBetween(1200, 5365))
                    for(let rootIndex = 0; rootIndex < rootCategoryResponse.ProductCategories.length; rootIndex++) {
                        // For each root category
                        const rootCategoryRecord = rootCategoryResponse.ProductCategories[rootIndex]
                        const productCategoryResponse = await this.getProductCategories(rootCategoryRecord.CategoryID)
                        if (productCategoryResponse && productCategoryResponse.ProductCategories && productCategoryResponse.ProductCategories.length > 0) {
                            // We have a list of sub categories for the root category
                            await this.sleep(Utils.getRandomIntBetween(1344, 5766))
                            for (let categoryIndex = 0; categoryIndex < productCategoryResponse.ProductCategories.length; categoryIndex++) {
                                const productCategoryRecord = productCategoryResponse.ProductCategories[categoryIndex]
                                // Get list of all products in the sub category and write response to json file
                                const productByCategoryResponse = await this.getProductsByCategory(productCategoryRecord.CategoryID)
                                if (productByCategoryResponse && productByCategoryResponse.Products && productByCategoryResponse.Products.length > 0) {
                                    console.log(`Root Category: ${rootIndex+1} of ${rootCategoryResponse.ProductCategories.length} [Sub Category: ${categoryIndex+1} of ${productCategoryResponse.ProductCategories.length}]`)                                    
                                    let filename = Utils.newGuid()
                                    const proxy: any = productByCategoryResponse
                                    proxy.RootCategoryID = rootCategoryRecord.CategoryID
                                    proxy.RootCategoryDisplayName = rootCategoryRecord.CategoryDisplayName
                                    proxy.ProductCategoryID = productCategoryRecord.CategoryID
                                    proxy.ProductCategoryDisplayName = productCategoryRecord.CategoryDisplayName
                                    proxy.ts = ts
                                    await Utils.writeFile(path.join(process.cwd(), 'eddyResponse', `${filename}.json`),
                                    proxy)
                                    created++
                                }
                            }
                        }
                    }
                }
                return resolve({
                    created
                })
            } catch (err) {
                console.dir(err)
                return reject(err)
            }
        })
    }

    sleep(ms: number): Promise<boolean> {
        return new Promise(async(resolve, reject) => {
            setTimeout(() => {
                return resolve(true)
            }, ms)
        })
    }

}
export interface ProductCategoryResponse {
    ProductCategories: ProductCategory[]
}
export interface ProductCategory {
    CategoryID: number
    CategoryDisplayName: string
}
export interface ProductsByCategoryResponse {
    AvailableShown: boolean
    PriceShown: boolean
    MSRPShown: boolean
    PlaceOrder: boolean
    Categories: ProductCategoryResponse[]
    Products: ProductResponse[]
}
export interface ProductResponse {
    ProductID: string
    PartNumber: string
    LongDescription: string
    PrimaryImage: string
    TradePrice: number
    SalesPrice: number
    ClearancePrice: number
    FutureTradePrice: number
    FutureMSRPEffectiveDate: string
    FutureSalesPrice:number
    FutureSalesEffectiveDate: string
    QuantityAvailable: number
    ProductOrderable: number
    ReplacedBy: string
    IsDiscontinued: boolean
    IsTrainingProduct: boolean
    NonPurchasableMessage: string
    TirerPricingAvailable: boolean
}
export interface ProductMediaResponse {
    Media: ProductMedia[]
}
export interface ProductMedia {
    Disclaimer: string
    MediaAccess: string
    MediaFileName: string
    MediaID: number
    MediaTitle: string
    MediaTypeName: string
    MediaURL: string
}
export interface ProductFeatureResponse {
    Features: ProductFeature[]
}
export interface ProductFeature {
    FeatureName: string
    FeatureValue: string
}

const tester = new Tester()
tester.doImport().then(() => {
    console.log(`Response received`)
}).catch((e) => {
    console.log(`Error during fetch`)
})
/*
https://myeddie.edwardsfiresafety.com/Products/GetProductCategories with categoryID: -1
    ProductCategories[] {CategoryID, CategoryDisplayName}

    https://myeddie.edwardsfiresafety.com/Products/GetProductCategories with categoryID: 12 "Fire Alarm Telephones"
    ProductCategories[] {CategoryID, CategoryDisplayName} at a finer level e.g. Frontplates and Wallboxes, Telephone Handsets, Warden Stations

https://myeddie.edwardsfiresafety.com/Products/GetProductsByCategory with categoryID: 392 "Frontplates and Wallboxes"
    {AvailableShown, PriceShown, MSRPShown, PlaceOrder, Categories[] of ProductCategory above, Products[] of Product below}
    {
        ProductID, PartNumber, LongDescription, PrimaryImage, TradePrice, SalesPrice, ClearancePrice, FutureTradePrice, FutureMSRPEffectiveDate,
        FurtureSalesPrice, FutureSalesEffectiveDate, QuantityAvailable, ProductOrderable, ReplacedBy, IsDiscontinued, IsTrainingProduct,
        NonPurchasableMessage, TieredPricingAvailable
    }

https://myeddie.edwardsfiresafety.com/Products/GetProductMedia with productID of above product
    {Media[] of Media below}
    {
        Disclaimer, MediaAccess, MediaFileName, MediaID, MediaTitle, MediaTypeName, MediaURL
    }

https://myeddie.edwardsfiresafety.com/Products/GetProductFeatures with productID of above product
    {Features[] of Feature below}
    {
        FeatureName, FeatureValue
    }
*/