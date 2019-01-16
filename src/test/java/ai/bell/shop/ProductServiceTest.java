/**
 *
 */
package ai.bell.shop;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import ai.bell.shop.biz.service.ProductService;
import ai.bell.shop.spi.data.Product;

/**
 * @author john
 *
 */
@RunWith(SpringRunner.class)
@SpringBootTest
public class ProductServiceTest {

	@Autowired
	private ProductService productService;

	@Test
	public void testCreateProduct() {
		Product p = new Product();
		p.setName("test");
		p.setPrice(1L);
		productService.create(p);
	}
}
