/**
 *
 */
package ai.bell.shop.web.ctl.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.smthit.lang.data.ResponseBean;

import ai.bell.shop.biz.service.ProductService;
import ai.bell.shop.spi.data.Product;

/**
 * @author john
 *
 */
@Controller
@RequestMapping("products")
public class ProductCtl {

	@Autowired
	private ProductService productService;

	@GetMapping("create")
	public String createPage() {
		return "create";
	}

	@PostMapping
	@ResponseBody
	public ResponseBean create(Product p) {
		productService.create(p);
		return new ResponseBean(ResponseBean.OK, "create success", null);
	}

}
