/**
 *
 */
package ai.bell.shop.biz.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smthit.framework.dal.bettlsql.EntityManager;

import ai.bell.shop.dal.entity.ProductPO;


/**
 * @author john
 *
 */
@Service
public class ProductService implements EntityManager<ProductPO> {

	@Override
	@Transactional()
	public ProductPO create(Object obj) {
		ProductPO po = EntityManager.super.create(obj);
		if (true) {
			throw new RuntimeException("test roll back");
		}
		return po;
	}

}
